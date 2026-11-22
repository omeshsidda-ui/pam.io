#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo 'Downloading verified Snake.io reference screenshots...'
curl -fL "https://snake.io/blog/wp-content/uploads/2023/12/1-min-1024x441.png" -o "01-web-main-menu.png"
curl -fL "https://snake.io/blog/wp-content/uploads/2025/04/5-5-Reasons-Why-Snake.io-is-the-Best-Offline-and-Online-Game-1024x472.png" -o "02-mobile-main-menu.png"
curl -fL "https://snake.io/blog/wp-content/uploads/2025/03/snakeio-friends-same-server-1-min2.png" -o "03-mobile-landscape-frame.png"
curl -fL "https://snake.io/blog/wp-content/uploads/2023/12/3-min-1-1024x303.png" -o "04-control-setup-modal.png"
curl -fL "https://i.redd.it/o17c572ueorb1.jpg" -o "05-skin-shop.jpg"
curl -fL "https://play-lh.googleusercontent.com/n2oU7y3FeEQa9_PB2nk4OLQx1X7p9mY7ZmvYvp6fWqbQOsvYwIg58Et9GW5PUPRtfMovtGr4nIIZH7tYCjkV5IU=w1200-h675-rw" -o "06-gameplay-hd-snakes.webp"
curl -fL "https://snake.io/blog/wp-content/uploads/2025/04/how-to-defeat-boss-snake-2-min-1024x456.png" -o "07-gameplay-boss-charging-bolt.png"
curl -fL "https://play-lh.googleusercontent.com/CNat4B7horuryrg7r9skUCVrYK6N4vJFGD6ieDz09SD451NtrjLlqfXqdK0VisehmiVd8W1jduZQ7TEBTxs26g=w1200-h675-rw" -o "08-live-event-skins-banner.webp"
curl -fL "https://store-images.s-microsoft.com/image/apps.44066.13653753385690923.34a43ec0-682d-4c7b-9f18-59bbb064bf4f.3b11829f-1934-4819-aa98-37b6f84a8cbc" -o "09-leaderboard-screen.png"
curl -fL "https://imgs.crazygames.com/snake-io_16x9/20260302021932/snake-io_16x9-cover?metadata=none&quality=100&width=1200&height=630&fit=crop" -o "10-crazygames-cover.jpg"
echo 'Done! All screenshots saved.'
