# Contributing to DevPilot AI

Thank you for your interest in contributing to **DevPilot AI**! We welcome contributions, bug reports, and feature proposals.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/tarunyadav1230/Devpilot-ai.git
   cd Devpilot-ai
   ```

2. **Backend Setup**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

3. **Frontend Setup**:
   ```bash
   cd ui
   npm install
   npm run dev
   ```

4. **Docker Workflow**:
   ```bash
   docker-compose up --build
   ```

---

## 📐 Git Workflow & Commit Guidelines

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Code formatting, white-space, etc. (no production code change)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Maintenance, dependency upgrades, build configs

---

## 🧪 Testing

Ensure all automated tests and RAG benchmarks succeed before submitting a pull request:

```bash
# Evaluate RAG retrieval benchmarks
python tests/eval_rag.py

# Frontend build check
cd ui && npm run build
```

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

