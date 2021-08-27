const fs = require('fs');

/* Welcome to the horribly inefficient static-data processor. You only need to run this occasionaly
   as a build time task to update our static game files. */

const mapSolarSystems = fs.readFileSync('src/static/mapSolarSystems.json');
const solarSystems = JSON.parse(mapSolarSystems)
    .filter(s => s.solarSystemID !== 30003270) // for some reason, this system doesn't have a proper name
    .map(system => ({
        regionID: system.regionID,
        constellationID: system.constellationID,
        solarSystemID: system.solarSystemID,
        solarSystemName: system.solarSystemName,
    })).reduce((map, curr) => {
        map[curr.solarSystemID] = curr;
        return map
    }, {});
fs.writeFileSync('src/static/mapSolarSystems.json', JSON.stringify(solarSystems, null, 1))


const invTypeData = fs.readFileSync('src/static/invTypes.json');
const invVolumeData = fs.readFileSync('src/static/invVolumes.json');

const volumes = JSON.parse(invVolumeData)

const invTypes = JSON.parse(invTypeData)
    .filter(t => !!t.marketGroupID && t.published === 1)
    .map(t => {
        // Strip off a bunch of fields we don't need
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { description, soundID, mass, capacity, portionSize, published, raceID, ...rest } = t;

        const packagedVolume = (volumes.find(v => v.typeID === t.typeID) || { volume: 0 }).volume

        return {
            packagedVolume: packagedVolume === 0 ? t.volume : packagedVolume,
            ...rest
        }
    }).reduce((acc, curr) => {
        acc[curr.typeID] = curr;
        delete curr.typeID;
        return acc;
    }, {});


fs.writeFileSync('src/static/invTypesMinimal.json', JSON.stringify(invTypes, null, 1))