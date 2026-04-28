# Fix "ENOENT: no such file or directory, uv_cwd" Error

## Problem
You're getting this error when trying to run `npm run dev`:
```
Error: ENOENT: no such file or directory, uv_cwd
```

## Cause
This error occurs when:
1. The terminal's current working directory was deleted
2. The terminal session lost track of the current directory
3. You're in a directory that no longer exists

## Solution

### Quick Fix
1. **Close the current terminal** (or open a new terminal window)
2. **Navigate to the admin directory:**
   ```bash
   cd /Users/krishnams/Downloads/Docplus/admin
   ```
3. **Run the dev server:**
   ```bash
   npm run dev
   ```

### Alternative: Use Full Path
If you're still having issues, use the full path:
```bash
cd /Users/krishnams/Downloads/Docplus/admin && npm run dev
```

### Verify It's Working
After running `npm run dev`, you should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

Then open: **http://localhost:5174** in your browser

## Prevention
- Always use `cd` to navigate to directories before running commands
- If a directory seems "lost", close and reopen the terminal
- Use `pwd` to check your current directory if unsure

