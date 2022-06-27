import fixText from "./fixtext";
import { PDFDocument, StandardFonts, rgb } from "./pdf-lib";

async function mergeAllPDFs(urls) {
	const numDocs = urls.length;
	const pdfDoc = await PDFDocument.create();
	for(var i = 0; i < numDocs; i++) {
		const jpgImageBytes = await fetch(urls[i]).then((res) => res.arrayBuffer())
		const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
		const page = pdfDoc.addPage()
		page.drawImage(jpgImage, {
			width: page.getWidth(),
			height: page.getHeight(),
		})
	}
    const pdfDataUri = await pdfDoc.save();
    return pdfDataUri;
    // strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
    // var data_pdf = pdfDataUri.substring(pdfDataUri.indexOf(',')+1);
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
  var datab = searchRes.match(regex);
  var all_product = searchRes.split('class="slide-image"');
  
  
  var i,
    result = [];
  for (i = 1; i < all_product.length; i++) {
	  var slideimg = all_product[i]
					.split('srcset="')[1]
					.split('id="slide-image')[0]
					.split(', ');
	   var img = slideimg[slideimg.length - 1].split(' ')[0];
	  
	  result.push(img);
  }
    var generator = await mergeAllPDFs(result);

  return generator;
}
