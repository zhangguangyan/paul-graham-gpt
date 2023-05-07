
```mermaid
sequenceDiagram
participant user
participant app
participant pgvector
participant openai

app ->> app: get text in chunks
app ->> openai: emebedding of chunk
app ->> pgvector: save embedding
user ->> app: ask quesion
app ->> openai: emebedding of question
app ->> pgvector: find similar
app ->> openai: completion endpoint
```