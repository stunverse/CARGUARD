-- =====================================================================
-- CarGuard AI — Seed data
--   * The 8 mandatory exterior photo points (Hidden Damage Scanner).
--   * Default plan usage limits.
-- =====================================================================

insert into public.inspection_photo_points
  (code, title, description, required, order_index, category, instruction, why_it_matters, expected_angle, ai_detection_targets)
values
  (
    'front_view', 'Front view',
    'Complete front of the vehicle.', true, 1, 'exterior',
    'Stand directly in front of the vehicle. Take a clear photo showing the entire front of the car, including the hood, headlights, grille, bumper, and both front corners.',
    'Analyzes hood/headlight/bumper alignment, grille replacement, color differences across front panels, visible front impact, and front symmetry.',
    'front',
    '["hood_alignment","headlight_alignment","front_bumper_alignment","grille_alignment","front_symmetry","color_difference_front_panels","visible_damage_front","possible_previous_front_repair"]'::jsonb
  ),
  (
    'rear_view', 'Rear view',
    'Complete rear of the vehicle.', true, 2, 'exterior',
    'Stand directly behind the vehicle. Take a clear photo showing the entire rear of the car, including the trunk, rear lights, bumper, and both rear corners.',
    'Analyzes trunk/tail-light/bumper alignment, color differences, replaced bumper, possible rear impact, and rear symmetry.',
    'rear',
    '["trunk_alignment","rear_light_alignment","rear_bumper_alignment","rear_symmetry","color_difference_rear_panels","visible_damage_rear","possible_previous_rear_repair"]'::jsonb
  ),
  (
    'left_side_view', 'Left side view',
    'Complete left side, front to rear bumper.', true, 3, 'exterior',
    'Stand on the left side of the vehicle. Take a clear photo showing the entire side from front bumper to rear bumper.',
    'Analyzes fender/door/quarter-panel alignment, rocker panel, side color consistency, lateral impact, and replaced/repainted panels.',
    'left_side',
    '["left_front_fender_alignment","left_front_door_alignment","left_rear_door_alignment","left_rear_quarter_alignment","left_rocker_panel_condition","left_side_color_consistency","left_side_visible_damage","possible_left_side_repair"]'::jsonb
  ),
  (
    'right_side_view', 'Right side view',
    'Complete right side, front to rear bumper.', true, 4, 'exterior',
    'Stand on the right side of the vehicle. Take a clear photo showing the entire side from front bumper to rear bumper.',
    'Analyzes fender/door/quarter-panel alignment, rocker panel, side color consistency, lateral impact, and replaced/repainted panels.',
    'right_side',
    '["right_front_fender_alignment","right_front_door_alignment","right_rear_door_alignment","right_rear_quarter_alignment","right_rocker_panel_condition","right_side_color_consistency","right_side_visible_damage","possible_right_side_repair"]'::jsonb
  ),
  (
    'front_left_diagonal', 'Front-left diagonal view',
    'Three-quarter front-left angle.', true, 5, 'exterior',
    'Stand at the front-left corner of the vehicle. Take a photo showing both the front and the left side of the car.',
    'Analyzes consistency between front and left side, hood-to-fender gap, bumper-to-fender alignment, left headlight, reflections/tone, and front-left impact.',
    'front_left',
    '["front_left_corner_alignment","hood_to_left_fender_gap","bumper_to_left_fender_alignment","left_headlight_position","left_front_panel_color_consistency","front_left_visible_damage","possible_front_left_repair"]'::jsonb
  ),
  (
    'front_right_diagonal', 'Front-right diagonal view',
    'Three-quarter front-right angle.', true, 6, 'exterior',
    'Stand at the front-right corner of the vehicle. Take a photo showing both the front and the right side of the car.',
    'Analyzes consistency between front and right side, hood-to-fender gap, bumper-to-fender alignment, right headlight, reflections/tone, and front-right impact.',
    'front_right',
    '["front_right_corner_alignment","hood_to_right_fender_gap","bumper_to_right_fender_alignment","right_headlight_position","right_front_panel_color_consistency","front_right_visible_damage","possible_front_right_repair"]'::jsonb
  ),
  (
    'rear_left_diagonal', 'Rear-left diagonal view',
    'Three-quarter rear-left angle.', true, 7, 'exterior',
    'Stand at the rear-left corner of the vehicle. Take a photo showing both the rear and the left side of the car.',
    'Analyzes consistency between rear and left side, trunk-to-quarter gap, bumper-to-quarter alignment, left tail light, reflections/tone, and rear-left impact.',
    'rear_left',
    '["rear_left_corner_alignment","trunk_to_left_quarter_gap","rear_bumper_to_left_quarter_alignment","left_tail_light_position","left_rear_panel_color_consistency","rear_left_visible_damage","possible_rear_left_repair"]'::jsonb
  ),
  (
    'rear_right_diagonal', 'Rear-right diagonal view',
    'Three-quarter rear-right angle.', true, 8, 'exterior',
    'Stand at the rear-right corner of the vehicle. Take a photo showing both the rear and the right side of the car.',
    'Analyzes consistency between rear and right side, trunk-to-quarter gap, bumper-to-quarter alignment, right tail light, reflections/tone, and rear-right impact.',
    'rear_right',
    '["rear_right_corner_alignment","trunk_to_right_quarter_gap","rear_bumper_to_right_quarter_alignment","right_tail_light_position","right_rear_panel_color_consistency","rear_right_visible_damage","possible_rear_right_repair"]'::jsonb
  )
on conflict (code) do nothing;

-- Default plan usage limits.
insert into public.usage_limits
  (plan_name, inspections_per_month, reports_per_month, photo_analysis_limit, follow_up_photos_limit, pdf_exports_limit)
values
  ('free',    1,    0,   8,   0,   0),
  ('starter', 3,    3,   40,  10,  3),
  ('plus',    10,   10,  150, 50,  10),
  ('pro',     1000, 1000, 5000, 1000, 1000)
on conflict (plan_name) do nothing;
