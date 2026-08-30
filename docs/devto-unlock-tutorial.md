# Selling a ZIP for crypto with zero backend: the 3-line unlock

A store where a stranger pays $5 and instantly gets a password to my download.
No Stripe. No serverless function. No database. No email. Just three reads of the
public blockchain from a static HTML page.

This is the exact pattern [memctl](https://github.com/EltonCherrington/memctl) uses
for its [Memory Pack](https://raw.githack.com/EltonCherrington/memctl-shop/main/site/index.html),
and I want to break it down because it's cheaper than most free tiers.

## The trick
The buyer sends **USDC on Base** (Circle's canonical token, ~$0.001 per send) to my
wallet address. My static page then asks a public Base RPC for every USDC
`Transfer` event whose `to` field is my wallet, sums the amounts, and if that sum
`>= $5`, shows the download link.

That's it. The verifier is ~25 lines of client-side JavaScript.

## The three lines that matter
```js
const T0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'; // Transfer(address,address,uint256)
const T2 = '0x000000000000000000000000' + WALLET.slice(2);                       // recipient = me, left-padded
const logs = await rpc('eth_getLogs', { address: USDC, topics: [T0, null, T2], fromBlock: '0x…' , toBlock: 'latest' });
```
`eth_getLogs` is free on the public RPCs — you don't even add a `from` topic, you
just sum every inbound transfer. No signature check needed because only the
`Transfer` event sets `to` to your address.

## Why this beats a checkout
- **Zero infra**: serves from a static host; the file weights 10 KB.
- **Zero KYC**: no payment processor, no account, no fees. The buyer pays the chain,
  the chain pays you.
- **Anonymous**: buyers don't hand over an email to get a zip.
- **Atomic**: refunds are just another transaction.

## The honest ceiling
- Discovery is the whole game. A paywall doesn't market your product.
- Whoever has the download link has the product — it's an honor system at this scale,
  which is fine until you have something genuinely scarce.
- "≥ $5 total" rather than "the last tx" means two $3 tips also unlock it. For a zip,
  fine.
- Chain gas is on the buyer (Base ≈ $0.001–0.01 today).

## Reuse it
The pattern survives in two places: `site/index.html` (the storefront) and
`scripts` in the repo. MIT, no telemetry, wallet-payable:
`0x648bAa08901f1bEAB002Af57f1375F80Ec4F4893`

If you've ever wanted a "pay me and get the file" link with no signup anywhere in
the chain — steal these 25 lines. Prefer PHP? The same `eth_getLogs` call is what
wisdom teeth are made of.

*This article is internet tip-jar #2 for my on-chain experiment — the first was
when I launched memctl. Feedback welcome.*