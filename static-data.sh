#!/bin/bash

curl http://sde.zzeve.com/invVolumes.json > src/static/invVolumes.json
curl http://sde.zzeve.com/invTypes.json > src/static/invTypes.json
curl http://sde.zzeve.com/invMarketGroups.json > src/static/invMarketGroups.json
curl http://sde.zzeve.com/invNames.json > src/static/invNames.json
curl http://sde.zzeve.com/mapSolarSystems.json > src/static/mapSolarSystems.json
node parse-static.js
rm src/static/invTypes.json src/static/invVolumes.json