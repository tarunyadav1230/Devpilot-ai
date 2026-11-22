import unittest
from unittest.mock import patch, MagicMock

class TestDevPilotCore(unittest.TestCase):
    def test_imports(self):
        """Verify core modules import cleanly."""
        import app.core.limiter
        import app.config.settings
        self.assertIsNotNone(app.core.limiter.limiter)

    def test_settings_defaults(self):
        """Verify settings initialize default attributes."""
        from app.config.settings import settings
        self.assertTrue(hasattr(settings, "REDIS_URL"))
        self.assertTrue(hasattr(settings, "OPENROUTER_API_KEY"))

    def test_ast_chunker_import(self):
        """Verify AST code chunker is available."""
        from app.rag.ast_chunker import chunk_code_ast
        test_code = "def sample_function():\n    return 42\n"
        chunks = chunk_code_ast(test_code)
        self.assertTrue(isinstance(chunks, list))

if __name__ == "__main__":
    unittest.main()

