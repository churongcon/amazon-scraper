import fixText from "./fixtext";
import { PDFDocument, StandardFonts, rgb } from "./pdf-lib";

async function mergeAllPDFs(urls) {
  const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
  const pngUrl = 'https://pdf-lib.js.org/assets/minions_banana_alpha.png'

  const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer())
  const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer())

  const pdfDoc = await PDFDocument.create()

  const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
  const pngImage = await pdfDoc.embedPng(pngImageBytes)

  const jpgDims = jpgImage.scale(0.5)
  const pngDims = pngImage.scale(0.5)

  const page = pdfDoc.addPage()

  page.drawImage(jpgImage, {
    x: page.getWidth() / 2 - jpgDims.width / 2,
    y: page.getHeight() / 2 - jpgDims.height / 2 + 250,
    width: jpgDims.width,
    height: jpgDims.height,
  })
  page.drawImage(pngImage, {
    x: page.getWidth() / 2 - pngDims.width / 2 + 75,
    y: page.getHeight() / 2 - pngDims.height + 250,
    width: pngDims.width,
    height: pngDims.height,
  })

    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
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
