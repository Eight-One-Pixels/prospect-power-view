
-- Drop the existing view and recreate it with the correct structure
DROP VIEW IF EXISTS profiles_with_roles;

CREATE VIEW profiles_with_roles AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.avatar_url,
  p.department,
  p.manager_id,
  p.hire_date,
  p.is_active,
  p.created_at,
  p.position,
  p.role_id,
  p.sys_role,
  ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id;
