import { Client } from "pg";

// export const config = {
//   runtime: "edge"
// };

const handler = async (req: Request): Promise<Response> => {
  try {
    const { query, apiKey, matches } = (await req.json()) as {
      query: string;
      apiKey: string;
      matches: number;
    };

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
        values: [embedding, 0.01, matches],
      };
      const result = await pgClient.query(query1);
      return new Response(JSON.stringify(result.rows), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    } finally {
      await pgClient.end();
    }

    // const { data: chunks, error } = await supabaseAdmin.rpc("pg_search", {
    //   query_embedding: embedding,
    //   similarity_threshold: 0.01,
    //   match_count: matches
    // });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
