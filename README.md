# Bratty Chess
<img width="1032" height="692" alt="Screenshot 2025-09-29 at 2 09 48 AM" src="https://github.com/user-attachments/assets/5339756d-cd21-4987-b6e7-500d1aa1fba9" />

Your opponent is a brat. 

Whenever they are materially disadvantaged, they ask to switch sides. 

Good luck!

## Caviats
- You cannot create a material disadvantage, while putting the opponent in check. This is because the sides would switch, and the bot can immediately capture your King
- It would be impossible to win against a bot trained on this mode. Thus, to keep things fun, we use a regular chess bot, and occasionally make it *blunder*

# Usage
1. Clone the directory
2. cd into the cloned directory
3. Make sure `npm` is installed. Type: `npm -v` in your terminal 
4. Install dependencies: `npm install`
5. Run: `npm run dev`
6. Open the link printed to stdout
