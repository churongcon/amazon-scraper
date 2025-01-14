const header = (req_headers) => {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Content-Type": "application/pdf",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Your-IP": req_headers.get("cf-connecting-ip"),
        "Your-Country": req_headers.get("CF-IPCountry"),
        "Host": req_headers.get("host"),
        "Content-Disposition": 'attachment',
    }
}

export default header
