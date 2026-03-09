import { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

let ssbPartnershipNotesColumnPromise: Promise<boolean> | null = null;

export type UserRecord = {
  id: number;
  ssb_id: number | null;
  name: string;
  email: string;
  password: string;
  role: "AYRES_ADMIN" | "SSB_ADMIN";
};

export type SsbProfile = {
  id: number;
  name: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  partnership_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Partnership = {
  id: number;
  ssb_id: number;
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
};

export type Participant = {
  id: number;
  ssb_id: number;
  name: string;
  nickname: string | null;
  birth_date: string | null;
  position: string | null;
  jersey_size: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  join_date: string | null;
  status: "ACTIVE" | "INACTIVE";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardSummary = {
  totalParticipants: number;
  activeParticipants: number;
  inactiveParticipants: number;
  latestParticipants: Participant[];
};

export type SsbAdminAccount = {
  id: number;
  name: string;
  email: string;
  role: "AYRES_ADMIN" | "SSB_ADMIN";
  ssbId: number | null;
  ssbName: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  partnershipNotes: string | null;
  partnershipStatus: "ACTIVE" | "INACTIVE" | "EXPIRED" | null;
  partnershipStartDate: string | null;
  partnershipEndDate: string | null;
};

async function hasSsbPartnershipNotesColumn() {
  if (!ssbPartnershipNotesColumnPromise) {
    ssbPartnershipNotesColumnPromise = pool
      .query<RowDataPacket[]>("SHOW COLUMNS FROM ssb LIKE 'partnership_notes'")
      .then(([rows]) => rows.length > 0)
      .catch(() => false);
  }

  return ssbPartnershipNotesColumnPromise;
}

export async function findUserByEmail(email: string) {
  const [rows] = await pool.query<(UserRecord & RowDataPacket)[]>(
    `
      SELECT id, ssb_id, name, email, password, role
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
}

export async function getPartnershipBySsbId(ssbId: number) {
  const [rows] = await pool.query<(Partnership & RowDataPacket)[]>(
    `
      SELECT id, ssb_id, start_date, end_date, status
      FROM partnerships
      WHERE ssb_id = ?
      ORDER BY end_date DESC
      LIMIT 1
    `,
    [ssbId],
  );

  return rows[0] ?? null;
}

export async function getSsbProfile(ssbId: number) {
  const hasPartnershipNotes = await hasSsbPartnershipNotesColumn();
  const [rows] = await pool.query<(SsbProfile & RowDataPacket)[]>(
    `
      SELECT
        id,
        name,
        logo,
        address,
        phone,
        ${hasPartnershipNotes ? "partnership_notes" : "NULL AS partnership_notes"},
        created_at,
        updated_at
      FROM ssb
      WHERE id = ?
      LIMIT 1
    `,
    [ssbId],
  );

  return rows[0] ?? null;
}

export async function updateSsbProfile(
  ssbId: number,
  input: Pick<SsbProfile, "name" | "logo" | "address" | "phone" | "partnership_notes">,
) {
  const hasPartnershipNotes = await hasSsbPartnershipNotesColumn();

  if (hasPartnershipNotes) {
    await pool.query(
      `
        UPDATE ssb
        SET
          name = ?,
          logo = ?,
          address = ?,
          phone = ?,
          partnership_notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [input.name, input.logo, input.address, input.phone, input.partnership_notes, ssbId],
    );
  } else {
    await pool.query(
      `
        UPDATE ssb
        SET
          name = ?,
          logo = ?,
          address = ?,
          phone = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [input.name, input.logo, input.address, input.phone, ssbId],
    );
  }

  return getSsbProfile(ssbId);
}

export async function getParticipantsBySsbId(ssbId: number) {
  const [rows] = await pool.query<(Participant & RowDataPacket)[]>(
    `
      SELECT
        id, ssb_id, name, nickname, birth_date, position, jersey_size,
        parent_name, parent_phone, address, join_date, status, notes,
        created_at, updated_at
      FROM participants
      WHERE ssb_id = ?
      ORDER BY created_at DESC, id DESC
    `,
    [ssbId],
  );

  return rows;
}

export async function createParticipant(
  ssbId: number,
  input: Omit<Participant, "id" | "ssb_id" | "created_at" | "updated_at">,
) {
  const [result] = await pool.query(
    `
      INSERT INTO participants (
        ssb_id, name, nickname, birth_date, position, jersey_size,
        parent_name, parent_phone, address, join_date, status, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      ssbId,
      input.name,
      input.nickname,
      input.birth_date,
      input.position,
      input.jersey_size,
      input.parent_name,
      input.parent_phone,
      input.address,
      input.join_date,
      input.status,
      input.notes,
    ],
  );

  const insertId = (result as { insertId: number }).insertId;
  const [rows] = await pool.query<(Participant & RowDataPacket)[]>(
    "SELECT * FROM participants WHERE id = ? LIMIT 1",
    [insertId],
  );

  return rows[0] ?? null;
}

export async function updateParticipant(
  participantId: number,
  ssbId: number,
  input: Omit<Participant, "id" | "ssb_id" | "created_at" | "updated_at">,
) {
  await pool.query(
    `
      UPDATE participants
      SET
        name = ?,
        nickname = ?,
        birth_date = ?,
        position = ?,
        jersey_size = ?,
        parent_name = ?,
        parent_phone = ?,
        address = ?,
        join_date = ?,
        status = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND ssb_id = ?
    `,
    [
      input.name,
      input.nickname,
      input.birth_date,
      input.position,
      input.jersey_size,
      input.parent_name,
      input.parent_phone,
      input.address,
      input.join_date,
      input.status,
      input.notes,
      participantId,
      ssbId,
    ],
  );

  const [rows] = await pool.query<(Participant & RowDataPacket)[]>(
    "SELECT * FROM participants WHERE id = ? AND ssb_id = ? LIMIT 1",
    [participantId, ssbId],
  );

  return rows[0] ?? null;
}

export async function deleteParticipant(participantId: number, ssbId: number) {
  const [result] = await pool.query(
    "DELETE FROM participants WHERE id = ? AND ssb_id = ?",
    [participantId, ssbId],
  );

  return (result as { affectedRows: number }).affectedRows > 0;
}

export async function getDashboardSummary(ssbId: number): Promise<DashboardSummary> {
  const [countRows] = await pool.query<
    ({ totalParticipants: number; activeParticipants: number; inactiveParticipants: number } & RowDataPacket)[]
  >(
    `
      SELECT
        COUNT(*) AS totalParticipants,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS activeParticipants,
        SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) AS inactiveParticipants
      FROM participants
      WHERE ssb_id = ?
    `,
    [ssbId],
  );

  const [latestRows] = await pool.query<(Participant & RowDataPacket)[]>(
    `
      SELECT
        id, ssb_id, name, nickname, birth_date, position, jersey_size,
        parent_name, parent_phone, address, join_date, status, notes,
        created_at, updated_at
      FROM participants
      WHERE ssb_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 5
    `,
    [ssbId],
  );

  const summary = countRows[0];

  return {
    totalParticipants: Number(summary?.totalParticipants ?? 0),
    activeParticipants: Number(summary?.activeParticipants ?? 0),
    inactiveParticipants: Number(summary?.inactiveParticipants ?? 0),
    latestParticipants: latestRows,
  };
}

export async function getSsbAdminAccounts() {
  const hasPartnershipNotes = await hasSsbPartnershipNotesColumn();
  const [rows] = await pool.query<(SsbAdminAccount & RowDataPacket)[]>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.ssb_id AS ssbId,
        s.name AS ssbName,
        s.logo,
        s.address,
        s.phone,
        ${hasPartnershipNotes ? "s.partnership_notes" : "NULL"} AS partnershipNotes,
        p.status AS partnershipStatus,
        p.start_date AS partnershipStartDate,
        p.end_date AS partnershipEndDate
      FROM users u
      LEFT JOIN ssb s
        ON s.id = u.ssb_id
      LEFT JOIN partnerships p
        ON p.id = (
          SELECT p2.id
          FROM partnerships p2
          WHERE p2.ssb_id = u.ssb_id
          ORDER BY p2.end_date DESC
          LIMIT 1
        )
      WHERE u.role = 'SSB_ADMIN'
      ORDER BY u.created_at DESC, u.id DESC
    `,
  );

  return rows;
}

type CreateSsbAdminInput = {
  ssbName: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  partnershipNotes: string | null;
  adminName: string;
  adminEmail: string;
  adminPasswordHash: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
};

type UpdateSsbAdminInput = {
  ssbName: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  partnershipNotes: string | null;
  adminName: string;
  adminEmail: string;
  adminPasswordHash: string | null;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
};

export async function createSsbAdminAccount(input: CreateSsbAdminInput) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const hasPartnershipNotes = await hasSsbPartnershipNotesColumn();

    const [existingUsers] = await connection.query<(UserRecord & RowDataPacket)[]>(
      `
        SELECT id, ssb_id, name, email, password, role
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [input.adminEmail],
    );

    if (existingUsers.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const [ssbResult] = hasPartnershipNotes
      ? await connection.query(
          `
            INSERT INTO ssb (name, logo, address, phone, partnership_notes)
            VALUES (?, ?, ?, ?, ?)
          `,
          [input.ssbName, input.logo, input.address, input.phone, input.partnershipNotes],
        )
      : await connection.query(
          `
            INSERT INTO ssb (name, logo, address, phone)
            VALUES (?, ?, ?, ?)
          `,
          [input.ssbName, input.logo, input.address, input.phone],
        );

    const ssbId = (ssbResult as { insertId: number }).insertId;

    await connection.query(
      `
        INSERT INTO users (ssb_id, name, email, password, role)
        VALUES (?, ?, ?, ?, 'SSB_ADMIN')
      `,
      [ssbId, input.adminName, input.adminEmail, input.adminPasswordHash],
    );

    await connection.query(
      `
        INSERT INTO partnerships (ssb_id, start_date, end_date, status)
        VALUES (?, ?, ?, ?)
      `,
      [ssbId, input.startDate, input.endDate, input.status],
    );

    await connection.commit();
    return { ssbId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateSsbAdminAccount(userId: number, input: UpdateSsbAdminInput) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const hasPartnershipNotes = await hasSsbPartnershipNotesColumn();

    const [userRows] = await connection.query<(UserRecord & RowDataPacket)[]>(
      `
        SELECT id, ssb_id, name, email, password, role
        FROM users
        WHERE id = ? AND role = 'SSB_ADMIN'
        LIMIT 1
      `,
      [userId],
    );

    const user = userRows[0];

    if (!user || !user.ssb_id) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    const [existingUsers] = await connection.query<(UserRecord & RowDataPacket)[]>(
      `
        SELECT id, ssb_id, name, email, password, role
        FROM users
        WHERE email = ? AND id <> ?
        LIMIT 1
      `,
      [input.adminEmail, userId],
    );

    if (existingUsers.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    if (hasPartnershipNotes) {
      await connection.query(
        `
          UPDATE ssb
          SET
            name = ?,
            logo = ?,
            address = ?,
            phone = ?,
            partnership_notes = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [input.ssbName, input.logo, input.address, input.phone, input.partnershipNotes, user.ssb_id],
      );
    } else {
      await connection.query(
        `
          UPDATE ssb
          SET
            name = ?,
            logo = ?,
            address = ?,
            phone = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [input.ssbName, input.logo, input.address, input.phone, user.ssb_id],
      );
    }

    if (input.adminPasswordHash) {
      await connection.query(
        `
          UPDATE users
          SET name = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [input.adminName, input.adminEmail, input.adminPasswordHash, userId],
      );
    } else {
      await connection.query(
        `
          UPDATE users
          SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [input.adminName, input.adminEmail, userId],
      );
    }

    await connection.query(
      `
        UPDATE partnerships
        SET start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE ssb_id = ?
      `,
      [input.startDate, input.endDate, input.status, user.ssb_id],
    );

    await connection.commit();
    return { ssbId: user.ssb_id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteSsbAdminAccount(userId: number) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [userRows] = await connection.query<(UserRecord & RowDataPacket)[]>(
      `
        SELECT id, ssb_id, name, email, password, role
        FROM users
        WHERE id = ? AND role = 'SSB_ADMIN'
        LIMIT 1
      `,
      [userId],
    );

    const user = userRows[0];

    if (!user || !user.ssb_id) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    await connection.query("DELETE FROM users WHERE ssb_id = ? AND role = 'SSB_ADMIN'", [user.ssb_id]);
    await connection.query("DELETE FROM ssb WHERE id = ?", [user.ssb_id]);

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
