// Ponte HTTPS para a revista Sem Rodapé.
// Mantém o domínio semrodape.sistemadonas.com.br e encaminha o tráfego ao Floot.
// Não armazena nem modifica matérias, banco de dados ou credenciais.
const FLOOT_ORIGIN = "https://revista-sem-rodape.floot.app";
const PUBLIC_HOST = "semrodape.sistemadonas.com.br";

export default {
  async fetch(request) {
    const original = new URL(request.url);
    const upstream = new URL(original.pathname + original.search, FLOOT_ORIGIN);
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("x-forwarded-host");
    if (headers.get("origin") === original.origin) {
      headers.set("origin", FLOOT_ORIGIN);
    }
    // Não permita que headers de cliente determinem o destino do proxy.
    const options = {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    };

    let response;
    try {
      response = await fetch(new Request(upstream, options));
    } catch {
      return new Response("A revista está temporariamente indisponível. Tente novamente.", {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    const out = new Headers(response.headers);
    const loc = out.get("location");
    if (loc) {
      try {
        const redirectTo = new URL(loc, FLOOT_ORIGIN);
        if (redirectTo.origin === FLOOT_ORIGIN) {
          redirectTo.host = original.host;
          redirectTo.protocol = original.protocol;
          out.set("location", redirectTo.toString());
        }
      } catch {
        // Não altera redirecionamentos externos.
      }
    }

    // Ajusta cookies com Domain explícito para o domínio público da revista.
    if (typeof response.headers.getSetCookie === "function") {
      const cookies = response.headers.getSetCookie();
      if (cookies.length) {
        out.delete("set-cookie");
        for (const cookie of cookies) {
          out.append("set-cookie", cookie.replace(/;\\s*Domain=(?:\\.?floot\\.app|revista-sem-rodape\\.floot\\.app)(?=;|$)/gi, ""));
        }
      }
    }

    if (original.hostname !== PUBLIC_HOST && original.hostname.endsWith(".pages.dev")) {
      out.set("X-Robots-Tag", "noindex, nofollow");
    }
    const body = request.method === "HEAD" || [204, 205, 304].includes(response.status) ? null : response.body;
    return new Response(body, { status: response.status, headers: out });
  },
};
