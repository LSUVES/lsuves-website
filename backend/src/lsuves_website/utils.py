# Testing utils
class LongDocMixin:
    """A mixin for TestCase that overrides .shortDescription() to show the whole
    test doc comment"""

    def shortDescription(self):
        try:
            return "\n".join(
                [line.strip() for line in self._testMethodDoc.strip().splitlines()]
            )
        except AttributeError:
            return
