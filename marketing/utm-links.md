# UTM links — copy/paste for each channel

Same website; different `?utm_` tags so you can see what drove bookings (Google Analytics, Cloudflare Web Analytics, etc.).

## How to read them

| Parameter | Example | Meaning |
|-----------|---------|--------|
| `utm_source` | `telegram` | Platform |
| `utm_medium` | `organic` or `paid` | Post vs ad |
| `utm_campaign` | `legal-english-jun` | Your label |

## Site home

```
https://drilianavaliullina.com/?utm_source=linkedin&utm_medium=organic&utm_campaign=legal-english-post1
https://drilianavaliullina.com/?utm_source=telegram&utm_medium=organic&utm_campaign=channel-intro
https://drilianavaliullina.com/?utm_source=instagram&utm_medium=organic&utm_campaign=reel-1
https://drilianavaliullina.com/?utm_source=facebook&utm_medium=paid&utm_campaign=dubai-jun-2026
```

## Free consultation (best for ads)

```
https://cal.com/iliana-valiullina/free-15-minute-consultation?utm_source=facebook&utm_medium=organic&utm_campaign=bio
https://cal.com/iliana-valiullina/free-15-minute-consultation?utm_source=instagram&utm_medium=organic&utm_campaign=bio
https://cal.com/iliana-valiullina/free-15-minute-consultation?utm_source=telegram&utm_medium=organic&utm_campaign=channel-intro
https://cal.com/iliana-valiullina/free-15-minute-consultation?utm_source=telegram&utm_medium=bot&utm_campaign=start
https://cal.com/iliana-valiullina/free-15-minute-consultation?utm_source=linkedin&utm_medium=organic&utm_campaign=academic-english-post
```

## Paid Meta boost (when used in ad link)

```
https://cal.com/iliana-valiullina/free-15-minute-consultation?utm_source=facebook&utm_medium=paid&utm_campaign=dubai-boost
https://cal.com/iliana-valiullina/free-15-minute-consultation?utm_source=instagram&utm_medium=paid&utm_campaign=dubai-boost
```

## Enable tracking on the site (one-time)

1. Cloudflare dashboard → your site → **Web Analytics** (free) — enable  
2. Optional: Google Analytics 4 property → add measurement ID to site later if you want

No website code change required for UTM to work — tags pass through in the URL until someone lands on Cal.com (Cal.com has its own analytics for bookings).
