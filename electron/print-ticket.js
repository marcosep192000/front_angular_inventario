const escpos = require('escpos');
escpos.USB = require('escpos-usb');

module.exports = function (saleCommon) {
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open(() => {
      printer
        .text('BON-BINI')
        .text('CUIT 27-29625726-0')
        .text('-------------------')
        .text(`Ticket: ${saleCommon.numero}`)
        .text(`Cliente: ${saleCommon.client?.name || 'Consumidor Final'}`)
        .text(`Fecha: ${new Date().toLocaleString()}`)
        .text('-------------------');

      saleCommon.ticketDetails.forEach(item => {
        const line = `${item.productName} x${item.amount}  $${(item.salePrice * item.amount).toFixed(2)}`;
        printer.text(line);
      });

      printer
        .text('-------------------')
        .text(`Total: $${saleCommon.total.toFixed(2)}`)
        .text('Gracias por su compra!')
        .cut()
        .close();
    });
  } catch (error) {
    console.error('Error al imprimir el ticket:', error);
  }
};
