# Based on:
# https://github.com/supabase/pg_graphql/blob/fe024e8a5e94e00547ecd2d6e65a6f839f4f0d3c/dockerfiles/db/Dockerfile

FROM supabase/postgres:14.1.0 as build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    cmake \
    git \
    python2 \
    postgresql-server-dev-14 \
    && rm -rf "/var/lib/apt/lists/*"

RUN export \
    VERSION="v0.7.0" \
    REPO_URL="https://github.com/graphql/libgraphqlparser" \
    && git clone -b "${VERSION}" --depth 1 "${REPO_URL}" /libgraphqlparser \
    && cd /libgraphqlparser \
    && cmake . \
    && make install

RUN export \
    VERSION="v0.1.0-beta.1" \
    REPO_URL="https://github.com/supabase/pg_graphql" \
    && git clone -b "${VERSION}" --depth 1 "${REPO_URL}" /pg_graphql \
    && cd /pg_graphql \
    && ./bin/pgc build \
    && make install

FROM supabase/postgres:14.1.0 as main

# libgraphqlparser
ENV LD_LIBRARY_PATH="/usr/local/lib:${LD_LIBRARY_PATH}"
COPY --from=build ["/usr/local/lib/libgraphqlparser.so", "/usr/local/lib/libgraphqlparser.so"]

# pg_graphql
COPY --from=build ["/usr/lib/postgresql", "/usr/lib/postgresql"]
COPY --from=build ["/usr/share/postgresql", "/usr/share/postgresql"]