ALTER TABLE users ADD COLUMN checkin_day INTEGER NOT NULL DEFAULT 0 CHECK (checkin_day BETWEEN 0 AND 7);
UPDATE users SET checkin_day = CASE WHEN last_checkin_date IS NULL THEN 0 ELSE checkin_cycle + 1 END;
