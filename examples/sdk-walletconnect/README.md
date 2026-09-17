# Malicious approval (WalletConnect)

User intent: connect to a dApp.

Actual signing request: unlimited token approval.

SAI Guard should return `BLOCKED`. This example never signs.

```bash
npx tsx examples/sdk-walletconnect/index.ts
```
