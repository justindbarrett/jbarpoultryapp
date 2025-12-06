import { onSchedule } from "firebase-functions/v2/scheduler";
import { admin, db } from "./../config/firebase";

/**
 * Function to generate a random alphanumeric code (e.g., 10 characters)
 * @return {string} A random 10-character alphanumeric code
 */
function generateRandomCode() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const dailyCodeGenerator = onSchedule({
    // Cron expression (Runs at 12:00 AM daily)
    schedule: "0 0 * * *", 
    // Set this to your desired timezone
    timeZone: "America/Denver", 
  }, 
  async () => {
    const newCode = generateRandomCode();
    const today = new Date().toISOString().slice(0, 10);
    
    // Save the new code to Firestore
    try {
      await db.collection("dailyCodes").doc("current").set({
        code: newCode,
        date: today,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`Successfully generated and saved new daily code: ${newCode}`);
      return; 
    } catch (error) {
      console.error("Error saving daily code:", error);
      return;
    }
});
