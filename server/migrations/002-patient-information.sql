-- Additive: existing names and barangays remain unchanged.
ALTER TABLE patients
 ADD COLUMN first_name text NOT NULL DEFAULT '',
 ADD COLUMN last_name text NOT NULL DEFAULT '',
 ADD COLUMN middle_name text NOT NULL DEFAULT '',
 ADD COLUMN suffix text NOT NULL DEFAULT '',
 ADD COLUMN sex text NOT NULL DEFAULT '',
 ADD COLUMN birthplace text NOT NULL DEFAULT '',
 ADD COLUMN blood_type text NOT NULL DEFAULT '',
 ADD COLUMN civil_status text NOT NULL DEFAULT '',
 ADD COLUMN maiden_name text NOT NULL DEFAULT '',
 ADD COLUMN spouse_name text NOT NULL DEFAULT '',
 ADD COLUMN mother_name text NOT NULL DEFAULT '',
 ADD COLUMN educational_attainment text NOT NULL DEFAULT '',
 ADD COLUMN employment_status text NOT NULL DEFAULT '',
 ADD COLUMN family_position text NOT NULL DEFAULT '',
 ADD COLUMN family_position_other text NOT NULL DEFAULT '',
 ADD COLUMN region_code text NOT NULL DEFAULT '',
 ADD COLUMN province_code text NOT NULL DEFAULT '',
 ADD COLUMN city_code text NOT NULL DEFAULT '',
 ADD COLUMN barangay_code text NOT NULL DEFAULT '',
 ADD COLUMN street text NOT NULL DEFAULT '',
 ADD COLUMN region text NOT NULL DEFAULT '',
 ADD COLUMN province text NOT NULL DEFAULT '',
 ADD COLUMN city text NOT NULL DEFAULT '',
 ADD COLUMN address_release text NOT NULL DEFAULT '',
 ADD COLUMN household_no text NOT NULL DEFAULT '',
 ADD COLUMN philhealth_status text NOT NULL DEFAULT '',
 ADD COLUMN philhealth_no text NOT NULL DEFAULT '',
 ADD COLUMN philhealth_category text NOT NULL DEFAULT '',
 ADD COLUMN dswd_nhts boolean,
 ADD COLUMN four_ps_member boolean,
 ADD COLUMN philhealth_member boolean,
 ADD COLUMN pcb_member boolean;
CREATE INDEX patient_creation_facility ON audit_events(target_id,facility_id) WHERE action='patient.create';
CREATE INDEX patient_registration_lookup ON registration_requests(patient_id);
CREATE INDEX patient_booking_lookup ON bookings(patient_id);
CREATE INDEX patient_visit_lookup ON visits(patient_id);
