import { Client } from "pg";

// export const config = {
//   runtime: "edge"
// };

const handler = async (req: any, response: any): Promise<Response> => {
  try {
    const { query, apiKey, matches } = req.body as any;

    const input = query.replace(/\n/g, " ");

    const res = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input
      })
    });

    const json = await res.json();
    const embedding = json.data[0].embedding;

    const pgClient = new Client({
      host: 'db',
      port: 5432,
      database: 'rabbit',
      user: 'rabbit',
      password: 'pass',
    });
    await pgClient.connect();
    try {
      const query1 = {
        text: 'SELECT * FROM pg_search($1, $2, $3)',
        values: [JSON.stringify(embedding), 0.01, matches],
      };
      const result = await pgClient.query(query1);
      return response.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      return response.status(500);
    } finally {
      await pgClient.end();
    }

  } catch (error) {
    console.error(error);
      return response.status(500);
  }
};

export default handler;
