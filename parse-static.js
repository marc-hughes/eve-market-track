const fs = require('fs');

/* Welcome to the horribly inefficient static-data processor. You only need to run this occasionaly
   as a build time task to update our static game files. */

const invTypeData = fs.readFileSync('src/static/invTypes.json');
const invVolumeData = fs.readFileSync('src/static/invVolumes.json');

const volumes = JSON.parse(invVolumeData)

const invTypes = JSON.parse(invTypeData)
    .filter(t => !!t.marketGroupID && t.published === 1)
    .map(t => {
        // Strip off description
        const { description, soundID,
            mass, capacity, portionSize,
            published,
            raceID, ...rest } = t;

        const packagedVolume = (invVolumeData.find(v => v.typeID === t.typeID) || { volume: 0 }).volume

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