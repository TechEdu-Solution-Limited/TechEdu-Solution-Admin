/**
 * Webpack plugin to remove console statements in production
 * This provides additional console removal beyond Next.js built-in functionality
 */

class ConsoleRemoverPlugin {
  constructor(options = {}) {
    this.options = {
      exclude: ['error', 'warn'], // Keep these console methods
      ...options
    };
  }

  apply(compiler) {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    compiler.hooks.compilation.tap('ConsoleRemoverPlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapAsync(
        'ConsoleRemoverPlugin',
        (chunks, callback) => {
          chunks.forEach((chunk) => {
            chunk.files.forEach((file) => {
              if (file.endsWith('.js')) {
                const asset = compilation.assets[file];
                let source = asset.source();

                // Remove console statements (except excluded ones)
                this.options.exclude.forEach((excludeMethod) => {
                  const regex = new RegExp(
                    `console\\.${excludeMethod}\\s*\\([^)]*\\);?`,
                    'g'
                  );
                  source = source.replace(regex, '');
                });

                // Remove other console statements
                const consoleRegex = /console\.(log|info|debug|group|groupEnd|table|time|timeEnd)\s*\([^)]*\);?/g;
                source = source.replace(consoleRegex, '');

                compilation.assets[file] = {
                  source: () => source,
                  size: () => source.length
                };
              }
            });
          });
          callback();
        }
      );
    });
  }
}

module.exports = ConsoleRemoverPlugin;
