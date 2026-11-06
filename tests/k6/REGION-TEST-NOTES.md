# Nadanu staging region performance test

The staging Supabase database is in `ap-southeast-2` (Sydney). The voting Edge Function may automatically execute nearer the caller (for example `ap-south-1`, Mumbai).

Use `TEST_FUNCTION_REGION=ap-southeast-2` in the pre-authenticated k6 test to compare routing with the default. Keep all tests restricted to the separate staging project. Reuse neither previously voted sessions nor expired tokens. Do not test vote insertion against production.

This file documents staging testing only; it does not change the deployed website or voting logic.
