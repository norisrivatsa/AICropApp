import { LocationClient, SearchPlaceIndexForPositionCommand } from "@aws-sdk/client-location";
import { awsConfig } from "@/lib/aws/config";
import { LocationContext } from "@/lib/types";

const locationClient = new LocationClient({ region: awsConfig.region });

export async function reverseGeocode(lat: number, lng: number): Promise<LocationContext> {
  if (!awsConfig.locationPlaceIndex) return {};
  const output = await locationClient.send(
    new SearchPlaceIndexForPositionCommand({
      IndexName: awsConfig.locationPlaceIndex,
      Position: [lng, lat],
      MaxResults: 1
    })
  );

  const place = output.Results?.[0]?.Place;
  return {
    district: place?.Municipality,
    state: place?.Region,
    country: place?.Country
  };
}
