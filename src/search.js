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
  const regex = /class=\\"slide-image/gm;
  
  var all_product = searchRes.split('slide-image');
  
  var datab = searchRes.search(regex);
  var i,
    result = [];
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
