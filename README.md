# ac-disk-usage
`df -k` Linux/Mac OS command wrapper/parser. Usage:
```javascript
getDiskFreeSpace('/')
    .then(info => console.log(info))
    .catch(error => console.error(error))
```
Parameter for `getDiskFreeSpace` is optional and defaults to **/**.

The output should be object:
```json
{
  fileSystem: '/dev/disk1s5s1',
  size: 499963174912,
  used: 15332077568,
  available: 327549374464,
  usedInPercents: 5,
  mountedOn: '/',
  darwin: { iused: 553781, ifree: 4881899099, iusedInPercents: '0' }
}
```
*NOTE:* **darwin** property is optional and only exists on Mac OS system.