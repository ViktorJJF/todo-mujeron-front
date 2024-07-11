import { jsPDF } from 'jspdf'
import { delay } from '../../utils/delay'

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

function getTallas(product) {
  const tallas = []
  for (const variation of product.variations) {
    if (variation.attributes.talla) {
      const talla = variation.attributes.talla.option
      const isDuplicated = tallas.includes(talla)
      if (!isDuplicated) {
        tallas.push(talla)
      }
    }
  }

  return tallas
}

function getProductImageUrl({ multimedia }) {
  // search the the first image available
  let finalImage
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif']
  for (const media of multimedia) {
    const extension = media.url.split('.').pop()
    if (imageExtensions.includes(extension)) {
      finalImage = media.url
      break
    }
  }
  return `/api/wp-image?url=${finalImage}`
}

function formatDate() {
  const now = new Date()

  let day = now.getDate()
  let month = now.getMonth()
  let year = now.getFullYear()

  return `${day} de ${MONTHS[month].toLowerCase()} del ${year}`
}

function formatAmount(amount) {
  return new Intl.NumberFormat().format(amount)
}

function addProductDetails(
  product,
  doc,
  { x, y, width, height, country, includePrice }
) {
  const baseY = height + y - 4

  let leftText = `Rerefencia: ${product.ref} - Tallas disponibles: ${getTallas(
    product
  ).join(', ')}`
  doc.text(leftText, x - 3, baseY, { angle: 90 })

  let rightText = `Actualizado al ${formatDate()} - Pais: ${country}`
  doc.text(rightText, width + x + 6, baseY, { angle: 90 })

  if (includePrice) {
    const productPrice =
      product.regular_price || product.variations[0].regular_price
    const salePrice = product.sale_price || product.variations[0].sale_price

    const priceText = `Precio: ${formatAmount(productPrice)}`

    const priceTextPosition = {
      x: width + x + 6,
      y: baseY - rightText.length * 2.65,
    }

    const hasDiscount = salePrice > 0
    if (hasDiscount) {
      const priceTextWidth = doc.getTextWidth(priceText)
      const discountText = `Precio: ${formatAmount(salePrice)}`

      const priceLinePosition = {
        x: priceTextPosition.x,
        y: priceTextPosition.y - priceTextWidth,
      }

      doc
        .setTextColor(204, 204, 204)
        .text(priceText, priceTextPosition.x, priceTextPosition.y, {
          angle: 90,
        })
        .line(
          priceTextPosition.x - 2,
          priceTextPosition.y,
          priceLinePosition.x - 2,
          priceLinePosition.y
        )
        .setTextColor(0, 0, 0)
        .setFontSize(doc.getFontSize() + 2)
        .setFont(undefined, 'bold')
        .text(discountText, priceLinePosition.x, priceLinePosition.y - 4, {
          angle: 90,
        })
    } else {
      doc
        .setFontSize(doc.getFontSize() + 2)
        .setFont(undefined, 'bold')
        .text(priceText, priceTextPosition.x, priceTextPosition.y, {
          angle: 90,
        })
    }

    // return font to normal
    doc.setFontSize(doc.getFontSize() - 2).setFont(undefined, 'normal')
  }
}

export async function downloadPdf(
  products,
  { maxSize, includePrice, hideDetails, country }
) {
  if (!products.length) return

  let doc = new jsPDF()

  const PAGE_WIDTH = doc.internal.pageSize.getWidth()
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight()

  const imageSize = { width: 1080, height: 1920 }
  const height = PAGE_HEIGHT - 4
  const scaleFactor = height / imageSize.height
  const width = imageSize.width * scaleFactor

  const [x, y] = [(PAGE_WIDTH - width) / 2, (PAGE_HEIGHT - height) / 2]

  for (const [index, product] of products.entries()) {
    if (!hideDetails) {
      addProductDetails(product, doc, {
        x,
        y,
        width,
        height,
        country,
        includePrice,
      })
    }

    const image = getProductImageUrl(product)
    doc.addImage(image, 'JPEG', x, y, width, height)

    const filename = `${Date.now()}.pdf`

    const isLast = index === products.length - 1
    if (isLast) {
      doc.save(filename)
      return await delay(500)
    }

    if (maxSize) {
      let size = doc.output().length
      let sizeMb = size / (1024 * 1024)
      if (sizeMb >= maxSize) {
        doc.save(filename)
        await delay(500)
        doc = new jsPDF() // reset pdf
        continue
      }
    }

    doc.addPage()
  }
}
