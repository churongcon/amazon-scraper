import fixText from "./fixtext";
import PDFLib from "./pdf-lib";

async function mergeAllPDFs(urls) {
    
    const pdfDoc = await PDFLib.PDFDocument.create();
    const numDocs = urls.length;
    
    for(var i = 0; i < numDocs; i++) {
        const donorPdfBytes = await fetch(urls[i]).then(res => res.arrayBuffer());
        const donorPdfDoc = await PDFLib.PDFDocument.load(donorPdfBytes);
        const docLength = donorPdfDoc.getPageCount();
        for(var k = 0; k < docLength; k++) {
            const [donorPage] = await pdfDoc.copyPages(donorPdfDoc, [k]);
            //console.log("Doc " + i+ ", page " + k);
            pdfDoc.addPage(donorPage);
        }
    }

    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    //console.log(pdfDataUri);
  
    // strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
    var data_pdf = pdfDataUri.substring(pdfDataUri.indexOf(',')+1);
}

export default async function searchProducts(query, host) {
  const searchQuery = query.replace("https:/", "https://");
  const searchRes = await (
    await fetch(`${searchQuery}`, {
		method: 'GET',
		headers: {
		  //'Content-Type': 'application/xml'
		  // 'Content-Type': 'application/x-www-form-urlencoded',
		},
	})
  ).text();
  const regex = /class=\\"slide-image(.+?)src\=(.+?)id=\\"slide-image/gm;
  
  var all_product = searchRes.split('<img class=\"slide-image\"');
  
  var datab = searchRes.match(regex);
  var i,
    result = [];
  for (i = 1; i < all_product.length; i++) {
    /* (type 1) */
    try {
      var product_link =
        "https://www.amazon.in" +
        all_product[i]
          .split(
            '<a class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal" target="_blank" href="'
          )[1]
          .split('"')[0];

      if (product_link.includes("?")) {
        product_link = product_link.split("?")[0];
      }

      if (!product_link.includes("/gp/slredirect/")) {
        /* Not including sponsered products */
        result.push({
          name: fixText(
            all_product[i]
              .split(
                '<span class="a-size-medium a-color-base a-text-normal">'
              )[1]
              .split("</span>")[0]
          ),
          image: all_product[i]
            .split('src="')[1]
            .split('"')[0]
            .replace("_AC_UY218_.jpg", "_SL1000_.jpg"),
          price: parseFloat(
            all_product[i]
              .split(
                '<span class="a-price" data-a-size="l" data-a-color="price"><span class="a-offscreen">'
              )[1]
              .split("</span>")[0]
              .replace(/,/g, "")
              .replace("₹", "")
              .trim()
          ),
          original_price: parseFloat(
            all_product[i]
              .split(
                '<span class="a-price a-text-price" data-a-size="b" data-a-strike="true" data-a-color="secondary"><span class="a-offscreen">'
              )[1]
              .split("</span>")[0]
              .replace(/,/g, "")
              .replace("₹", "")
              .trim()
          ),
          product_link,
          query_url: product_link.replace("www.amazon.in", host + "/product"),
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  if (result.length === 0) {
    /* (type 2) */
    all_product = searchRes.split(
      '<div class="a-section a-spacing-medium a-text-center">'
    );

    for (i = 1; i < all_product.length; i++) {
      try {
        var product_link =
          "https://www.amazon.in" +
          all_product[i]
            .split(
              /<a class="a-link-normal.*a-text-normal" target="_blank" href="/
            )[1]
            .split('"')[0];

        if (product_link.includes("?")) {
          product_link = product_link.split("?")[0];
        }

        if (!product_link.includes("/gp/slredirect/")) {
          result.push({
            name: fixText(
              all_product[i]
                .split(
                  '<span class="a-size-base-plus a-color-base a-text-normal">'
                )[1]
                .split("</span>")[0]
            ),
            image: all_product[i]
              .split('src="')[1]
              .split('"')[0]
              .replace("_AC_UL320_.jpg", "_SL1000_.jpg"),
            price: parseFloat(
              all_product[i]
                .split(
                  '<span class="a-price" data-a-size="l" data-a-color="price"><span class="a-offscreen">'
                )[1]
                .split("</span>")[0]
                .replace(/,/g, "")
                .replace("₹", "")
                .trim()
            ),
            original_price: parseFloat(
              all_product[i]
                .split(
                  '<span class="a-price a-text-price" data-a-size="b" data-a-strike="true" data-a-color="secondary"><span class="a-offscreen">'
                )[1]
                .split("</span>")[0]
                .replace(/,/g, "")
                .replace("₹", "")
                .trim()
            ),
            product_link,
            query_url: product_link.replace("www.amazon.in", host + "/product"),
          });
        }
      } catch (err) {}
    }
  }

  return JSON.stringify(
    {
      status: true,
      total_result: all_product.length,
      query: all_product,
      fetch_from: datab,
      result,
    },
    null,
    2
  );
}
