# Backend Scripts Reference

Just like `npm run` in JavaScript, you now have multiple ways to run backend scripts!

## 🚀 Quick Start

```bash
cd backend
make start
```

## 📋 All Available Commands

### Development Commands

| Command      | Description                       | Similar to npm  |
| ------------ | --------------------------------- | --------------- |
| `make start` | Start dev server with auto-reload | `npm start`     |
| `make dev`   | Same as start                     | `npm run dev`   |
| `make run`   | Same as start                     | `npm run serve` |
| `make prod`  | Start production server           | `npm run prod`  |

### Setup & Installation

| Command            | Description                   | Similar to npm           |
| ------------------ | ----------------------------- | ------------------------ |
| `make install`     | Install dependencies          | `npm install`            |
| `make install-dev` | Install with dev dependencies | `npm install --save-dev` |
| `make setup`       | Setup project                 | `npm ci`                 |

### Code Quality

| Command         | Description                 | Similar to npm          |
| --------------- | --------------------------- | ----------------------- |
| `make format`   | Format code (black + isort) | `npm run format`        |
| `make lint`     | Run linters                 | `npm run lint`          |
| `make test`     | Run tests                   | `npm test`              |
| `make test-cov` | Run tests with coverage     | `npm run test:coverage` |

### Utilities

| Command          | Description                  | Similar to npm      |
| ---------------- | ---------------------------- | ------------------- |
| `make check`     | Verify everything works      | `npm run check`     |
| `make clean`     | Clean cache files            | `npm run clean`     |
| `make clean-all` | Clean everything + venv      | `npm run clean:all` |
| `make shell`     | Python shell with app loaded | `npm run repl`      |
| `make db-check`  | Check database connection    | -                   |
| `make freeze`    | Update requirements.txt      | `npm shrinkwrap`    |
| `make upgrade`   | Upgrade all dependencies     | `npm update`        |

### Help

| Command     | Description                 |
| ----------- | --------------------------- |
| `make help` | Show all available commands |

---

## 🎯 Most Common Workflows

### Daily Development

```bash
cd backend
make start          # Start server
# Edit code - server auto-reloads
make test          # Run tests
make format        # Format code before commit
```

### First Time Setup

```bash
cd backend
make setup         # Install dependencies
make check         # Verify everything works
make start         # Start server
```

### Before Committing

```bash
make format        # Format code
make lint          # Check code quality
make test          # Run tests
```

### Production Deployment

```bash
make prod          # Start production server
```

---

## 🔄 Comparison with npm scripts

If this were `package.json`, it would look like:

```json
{
  "scripts": {
    "start": "make start",
    "dev": "make dev",
    "prod": "make prod",
    "install": "make install",
    "test": "make test",
    "format": "make format",
    "lint": "make lint",
    "clean": "make clean"
  }
}
```

---

## 💡 Pro Tips

### 1. Tab Completion

Makefile supports tab completion in most terminals:

```bash
make st<TAB>  # Completes to 'make start'
```

### 2. Multiple Commands

Run multiple commands:

```bash
make format lint test
```

### 3. From Project Root

You can also use the helper script from project root:

```bash
./start-backend.sh    # Runs backend/start.sh
```

---

## 🛠️ Advanced Usage

### Custom Port

Edit `backend/start.sh` and run:

```bash
./start.sh --port 8080
```

### Production Mode

```bash
./start.sh --prod
```

### Check What Make Will Do

```bash
make -n start     # Dry run (shows commands without running)
```

---

## 📝 Adding Your Own Scripts

Edit `backend/Makefile` and add:

```makefile
my-script: $(VENV) ## Description of my script
	@echo "Running my script..."
	@$(PYTHON_VENV) my_script.py
```

Then run:

```bash
make my-script
```

---

## 🎨 Color-Coded Output

All commands have beautiful, color-coded output:

- 🔵 Blue = Headers
- 🟢 Green = Success
- 🟡 Yellow = Info/Warning
- 🔴 Red = Error

---

## ❓ Need Help?

```bash
make help          # Show all commands
make              # Same as 'make help'
```

---

**Note:** Makefile is the standard in Python projects, just like package.json is in JavaScript!
