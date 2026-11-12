-- Log Best Model Metadata (SRS NFR-4)
INSERT INTO model_versions (model_version, created_at, dataset_version, random_seed, preprocessing_config, model_type, macro_f1_score)
VALUES ('v1.0_random_forest_1794298395', NOW(), '120k_synthetic_v1.0', 42, 'OneHot(ignore)+StandardScaler', 'Random Forest', 89.52);