export function useColor() {
  const light = [
    '#dbccb5',
    '#f2e8da',
    '#f3bf08',
    '#e5ebe3',
    '#d8e8e6',
    '#cacccb',
    '#b69574',
    '#dabe81',
    '#ffc4b2',
    '#cac2b9',
  ]

  const dark = [
    '#686767',
    '#646762',
    '#806f63',
    '#44413c',
    '#3b302f',
    '#755139',
    '#433331',
    '#ae7250',
    '#776a5f',
    '#bd9865',
    '#bd5745',
    '#b55a30',
    '#683b39',
    '#c86b3c',
    '#f9633b'
  ]

  function getRandomColor(darkColor: boolean = false) {
    const colorPalette = darkColor ? dark : light
    const randomNumber = Math.floor(Math.random() * colorPalette.length)
    return colorPalette[randomNumber]
  }

  return {
    light,
    dark,
    getRandomColor
  }
}
