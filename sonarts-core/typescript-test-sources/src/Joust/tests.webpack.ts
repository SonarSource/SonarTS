const context = (require as any).context("./ts", true, /\.spec\.tsx?$/);
context.keys().forEach(context);
