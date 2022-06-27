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
		},
	})
  ).text();
  const regex = /class=\\"slide-image/gm;
  var datab = searchRes.match(regex);
  var all_product = searchRes.split('class="slide-image"');
  
  var i,
    result = [];
  for (i = 1; i < all_product.length; i++) {
	  var slideimg = all_product[i]
					.split('srcset="')[1]
					.split('id="slide-image')[0]
					.split(', ');
	   var img = slideimg[slideimg.length - 1];
	  
	  result.push(fixText(img.split(' ')[0])
	  }
	 )
  }
  var generator = await mergeAllPDFs(result);
	
  return JSON.stringify(
    {
      status: true,
      total_result: all_product.length,
      query: all_product[1],
      fetch_from: datab,
      result,
    },
    null,
    2
  );
}
