# ==============================================================================
# Node Tests
# ==============================================================================

REPORTER = spec

test:
	@NODE_ENV=test NODE_PATH=lib ./node_modules/.bin/mocha \
		--reporter $(REPORTER)

coveralls:
	$(MAKE) test

	@NODE_ENV=test NODE_PATH=lib ./node_modules/.bin/mocha \
		--require blanket \
		--reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js

# ==============================================================================
# Static Analysis
# ==============================================================================

JSHINT = jshint
SOURCES = lib/passport-spotify

hint: lint
lint:
	$(JSHINT) $(SOURCES)


.PHONY: test hint lint nyan
