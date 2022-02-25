/** Slice the file into pieces */
export function sliceFile (file: File): {
  nSlices: number
  nextSlice: () => Promise<Blob>
} {
  const sliceSize = 1 * 1024
  const nSlices = Math.ceil(file.size / sliceSize)
  let currentSlice = 0
  const nextSlice = async () => {
    if (currentSlice >= nSlices) throw Error('No more slices')
    const start = currentSlice * sliceSize
    const end = Math.min((currentSlice + 1) * sliceSize, file.size)
    ++currentSlice
    return file.slice(start, end)
  }
  return { nSlices, nextSlice }
}
