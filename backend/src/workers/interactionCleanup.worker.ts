import { Worker, Queue } from "bullmq";
import { connection } from "../config/bullmqRedis.js";
import pool from "../config/db.js";
import { computeAndCacheRecommendations } from "../04-services/interactions.service.js";

export const CLEANUP_QUEUE_NAME = "interaction-cleanup-queue";

export const cleanupQueue = new Queue(CLEANUP_QUEUE_NAME, { connection });

const worker = new Worker(
  CLEANUP_QUEUE_NAME,
  async (job) => {
    if (job.name === "daily-cleanup") {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Apply 10% decay to all scores
        await client.query(`
          UPDATE user_subcategory_history 
          SET score = score * 0.9;
        `);
        
        await client.query(`
          UPDATE user_attribute_history 
          SET score = score * 0.9;
        `);

        // 2. Find subcategories to delete (score < 1.0)
        // We delete from user_attribute_history first to maintain data consistency
        await client.query(`
          DELETE FROM user_attribute_history
          WHERE (user_id, subcategory_id) IN (
            SELECT user_id, subcategory_id
            FROM user_subcategory_history
            WHERE score < 1.0
          );
        `);

        // Then delete the subcategories themselves
        await client.query(`
          DELETE FROM user_subcategory_history
          WHERE score < 1.0;
        `);

        // 3. Delete old data directly (older than 30 days)
        await client.query(`
          DELETE FROM user_attribute_history
          WHERE last_interaction_at < NOW() - INTERVAL '30 days';
        `);

        // Also delete subcategories older than 30 days
        await client.query(`
          DELETE FROM user_subcategory_history
          WHERE last_interaction_at < NOW() - INTERVAL '30 days';
        `);

        await client.query('COMMIT');
        console.log(`[Worker] Daily cleanup completed at ${new Date().toISOString()}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error("[Worker] Cleanup failed:", error);
        throw error;
      } finally {
        client.release();
      }
    } else if (job.name === "compute-recommendations") {
      const client = await pool.connect();
      try {
        // Find all users who have interaction history
        const result = await client.query('SELECT DISTINCT user_id FROM user_subcategory_history');
        const users = result.rows;
        
        console.log(`[Worker] Computing recommendations for ${users.length} users...`);
        for (const user of users) {
          await computeAndCacheRecommendations(user.user_id, 12);
        }
        console.log(`[Worker] Computed recommendations successfully at ${new Date().toISOString()}`);
      } catch (error) {
        console.error("[Worker] Compute recommendations failed:", error);
        throw error;
      } finally {
        client.release();
      }
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} has failed with ${err.message}`);
});
