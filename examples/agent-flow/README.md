# AI agent flow

SAI Guard MCP is a verification boundary. The agent must not sign.

## Intended path

```text
User: "Swap 1,000 USDC to ETH."

AI Agent
    → swap tool generates an unsigned transaction
    → guard_protect_transaction
    → SAI Guard simulates the transaction
    → intent verification
    → PROTECTED
    → agent presents the transaction for authorization
```

A `PROTECTED` result is not permission to sign.

## Malicious path — stop

```text
User intent: Swap 1,000 USDC → ETH

Generated transaction:
  -1,000 USDC
  -8,400 USDT
  unlimited approval to an unknown spender

SAI Guard: BLOCKED
```

Do not sign or broadcast that transaction.

Tool call shape:

```json
{
  "name": "guard_protect_transaction",
  "arguments": {
    "chain": "ethereum",
    "intent": {
      "type": "swap",
      "input": { "asset": { "symbol": "USDC" }, "amount": "1000" },
      "output": { "asset": { "symbol": "ETH" }, "minAmount": "0.31" }
    },
    "transaction": {
      "kind": "evm",
      "from": "0x2222222222222222222222222222222222222222",
      "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      "data": "0xdeadbeef"
    }
  }
}
```
