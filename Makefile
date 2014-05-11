# ==============================================================================
# Node Tests
# ==============================================================================

REPORTER = spec

test:
	@NODE_ENV=test NODE_PATH=lib ./node_modules/.bin/mocha \
		--reporter $(REPORTER)

coverage:
	@NODE_ENV=test NODE_PATH=lib ./node_modules/.bin/mocha \
		--require blanket \
		--reporter html-cov > ./test/coverage.html

# ==============================================================================
# Static Analysis
# ==============================================================================

JSHINT = jshint
SOURCES = lib/passport-spotify

hint: lint
lint:
	$(JSHINT) $(SOURCES)


.PHONY: test hint lint nyan
