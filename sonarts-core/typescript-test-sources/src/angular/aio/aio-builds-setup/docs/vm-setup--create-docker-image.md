# VM setup - Create docker image


## Checkout repository
- `git clone <repo-url>`


## Build docker image
- `<aio-builds-setup-dir>/scripts/build.sh [<name>[:<tag>] [--build-arg <NAME>=<value> ...]]`
- You can overwrite the default environment variables inside the image, by passing new values using
  `--build-arg`.

**Note:** The build script has to execute docker commands with `sudo`.


## Example
The following commands would create a docker image from GitHub repo `foo/bar` to be deployed on the
`foobar-builds.io` domain and accepting PR deployments from authors that are members of the
`bar-core` and `bar-docs-authors` teams of organization `foo`:

- `git clone https://github.com/foo/bar.git foobar`
- Run:
  ```
  ./foobar/aio-builds-setup/scripts/build.sh foobar-builds \
    --build-arg AIO_REPO_SLUG=foo/bar \
    --build-arg AIO_DOMAIN_NAME=foobar-builds.io \
    --build-arg AIO_GITHUB_ORGANIZATION=foo \
    --build-arg AIO_GITHUB_TEMA_SLUGS=bar-core,bar-docs-authors
  ```

A full list of the available environment variables can be found
[here](image-config--environment-variables.md).
