/**
 * Convert JTSK to WGS84
 *
 * @param x
 * @param y
 * @param h
 * @return {{jtsk_x: *, wgs84_lat: string, altitude: number, wgs84_lon: string, jtsk_y: *, lon: number, lat: number}}
 */
const jtsk2wgs84 = (x, y, h = 200) => {
  let coords = {
    jtsk_x: x,
    jtsk_y: y,
    wgs84_lat: '',
    wgs84_lon: '',
    lat: 0,
    lon: 0,
    altitude: 0
  }

  let a = 6377397.15508
  let e = 0.081696831215303
  let n = 0.97992470462083
  let uRo = 12310230.12797036
  let sinUQ = 0.863499969506341
  let cosUQ = 0.504348889819882
  let sinVQ = 0.420215144586493
  let cosVQ = 0.907424504992097
  let alpha = 1.000597498371542
  let k = 1.003419163966575

  let ro = Math.sqrt(x * x + y * y)
  let epsilon = 2 * Math.atan(y / (ro + x))
  let D = epsilon / n
  let S = 2 * Math.atan(Math.exp(1 / n * Math.log(uRo / ro))) - Math.PI / 2
  let sinS = Math.sin(S)
  let cosS = Math.cos(S)
  let sinU = sinUQ * sinS - cosUQ * cosS * Math.cos(D)
  let cosU = Math.sqrt(1 - sinU * sinU)
  let sinDV = Math.sin(D) * cosS / cosU
  let cosDV = Math.sqrt(1 - sinDV * sinDV)
  let sinV = sinVQ * cosDV - cosVQ * sinDV
  let cosV = cosVQ * cosDV + sinVQ * sinDV
  let lJtsk = 2 * Math.atan(sinV / (1 + cosV)) / alpha
  let t = Math.exp(2 / alpha * Math.log((1 + sinU) / cosU / k))
  let pom = (t - 1) / (t + 1)

  let sinB = pom

  do {
    sinB = pom
    pom = t * Math.exp(e * Math.log((1 + e * sinB) / (1 - e * sinB)))
    pom = (pom - 1) / (pom + 1)
  } while (Math.abs(pom - sinB) > 1e-15)

  let bJtsk = Math.atan(pom / Math.sqrt(1 - pom * pom))

  let f1 = 299.152812853
  let e2 = 1 - (1 - 1 / f1) * (1 - 1 / f1)
  ro = a / Math.sqrt(1 - e2 * Math.sin(bJtsk) * Math.sin(bJtsk))
  x = (ro + h) * Math.cos(bJtsk) * Math.cos(lJtsk)
  y = (ro + h) * Math.cos(bJtsk) * Math.sin(lJtsk)
  let z = ((1 - e2) * ro + h) * Math.sin(bJtsk)

  let dx = 570.69
  let dy = 85.69
  let dz = 462.84
  let wz = -5.2611 / 3600 * Math.PI / 180
  let wy = -1.58676 / 3600 * Math.PI / 180
  let wx = -4.99821 / 3600 * Math.PI / 180
  let m = 3.543e-6
  let xn = dx + (1 + m) * (x + wz * y - wy * z)
  let yn = dy + (1 + m) * (-wz * x + y + wx * z)
  let zn = dz + (1 + m) * (wy * x - wx * y + z)

  a = 6378137.0
  f1 = 298.257223563
  let aB = f1 / (f1 - 1)
  let p = Math.sqrt(xn * xn + yn * yn)
  e2 = 1 - (1 - 1 / f1) * (1 - 1 / f1)
  let theta = Math.atan(zn * aB / p)
  let st = Math.sin(theta)
  let ct = Math.cos(theta)
  t = (zn + e2 * aB * a * st * st * st) / (p - e2 * a * ct * ct * ct)
  let B = Math.atan(t)
  let L = 2 * Math.atan(yn / (p + xn))
  h = Math.sqrt(1 + t * t) * (p - a / Math.sqrt(1 + (1 - e2) * t * t))

  B = B / Math.PI * 180

  coords.lat = B

  let latitude = 'N'
  if (B < 0) {
    B = -B
    latitude = 'S'
  }

  let latDeg = Math.floor(B)
  B = (B - latDeg) * 60
  let latMin = Math.floor(B)
  B = (B - latMin) * 60
  let latSec = Math.round(B * 1000) / 1000
  latitude = latDeg + '°' + latMin + '\'' + latSec + latitude
  coords.wgs84_lat = latitude

  L = L / Math.PI * 180
  coords.lon = L
  let longitude = 'E'
  if (L < 0) {
    L = -L
    longitude = 'W'
  }

  let lonDeg = Math.floor(L)
  L = (L - lonDeg) * 60
  let lonMin = Math.floor(L)
  L = (L - lonMin) * 60
  let lonSec = Math.round(L * 1000) / 1000
  longitude = lonDeg + '°' + lonMin + '\'' + lonSec + longitude
  coords.wgs84_lon = longitude

  coords.altitude = Math.round((h) * 100) / 100

  return coords
}

export default jtsk2wgs84
