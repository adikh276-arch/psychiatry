import axios from 'axios';
import { sql } from './db';

export async function verifyAndInitializeUser(token: string): Promise<string | null> {
    try {
        const response = await axios.post('https://api.mantracare.com/user/user-info', { token });
        const { user_id } = response.data;

        if (!user_id || user_id === 'null') {
            console.error('No user_id returned from API');
            return null;
        }

        const userIdStr = user_id.toString();

        if (sql) {
            try {
                await sql`
                    CREATE TABLE IF NOT EXISTS users (
                        id BIGINT PRIMARY KEY,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                `;
                await sql`
                    INSERT INTO users (id)
                    VALUES (${user_id})
                    ON CONFLICT (id) DO NOTHING
                `;
            } catch (dbErr) {
                console.error('Failed to initialize user in DB:', dbErr);
            }
        }

        return userIdStr;
    } catch (err) {
        console.error('Handshake failed:', err);
        return null;
    }
}
