import {
  Plane,
  TrainFront,
  TrainFrontTunnel,
  Bus,
  Car,
  Footprints,
  Bike,
  Sailboat,
  Hourglass,
  Utensils,
  Wine,
  Landmark,
  Drama,
  ShoppingBag,
  Trees,
  BedDouble,
  Navigation,
  MapPin,
} from "lucide-react";
import type { Activity } from "@/data/itinerary";

// Literal JSX per branch (no dynamic component variable) keeps the
// react-hooks/static-components rule happy. Inherits color via currentColor.
export default function KindIcon({
  kind,
  size = 16,
}: {
  kind?: Activity["kind"];
  size?: number;
}) {
  switch (kind) {
    // getting around
    case "flight":
      return <Plane size={size} aria-hidden />;
    case "train":
      return <TrainFront size={size} aria-hidden />;
    case "subway":
      return <TrainFrontTunnel size={size} aria-hidden />;
    case "bus":
      return <Bus size={size} aria-hidden />;
    case "car":
      return <Car size={size} aria-hidden />;
    case "walk":
      return <Footprints size={size} aria-hidden />;
    case "bike":
      return <Bike size={size} aria-hidden />;
    case "boat":
      return <Sailboat size={size} aria-hidden />;
    case "layover":
      return <Hourglass size={size} aria-hidden />;
    // doing things
    case "food":
      return <Utensils size={size} aria-hidden />;
    case "drinks":
      return <Wine size={size} aria-hidden />;
    case "sight":
      return <Landmark size={size} aria-hidden />;
    case "show":
      return <Drama size={size} aria-hidden />;
    case "shopping":
      return <ShoppingBag size={size} aria-hidden />;
    case "outdoors":
      return <Trees size={size} aria-hidden />;
    case "lodging":
      return <BedDouble size={size} aria-hidden />;
    case "travel":
      return <Navigation size={size} aria-hidden />;
    default:
      return <MapPin size={size} aria-hidden />;
  }
}
