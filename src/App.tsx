import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Passenger {
  id: string;
  name: string;
  phone: string;
  pickupLocation: string;
}

interface TripData {
  departureTime: string;
  availableSeats: number;
  passengers: Passenger[];
}

interface RideData {
  date: Date;
  kingstonToToronto: TripData;
  torontoToKingston: TripData;
}

const torontoLocations = ["Airport", "Fairview", "Yorkdale", "STC", "Other"]
const kingstonLocations = ["Metro", "Kingston Center", "Petro Canada", "Other"]

// Placeholder data generation
const generatePassenger = (): Passenger => ({
  id: Math.random().toString(36).substr(2, 9),
  name: `Passenger ${Math.floor(Math.random() * 100)}`,
  phone: `+1${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
  pickupLocation: "Airport"
})

const generateRideData = (date: Date): RideData | null => {
  const isWeekend = date.getDay() === 0
  if (isWeekend) return null

  return {
    date,
    kingstonToToronto: {
      departureTime: '15:00',
      availableSeats: Math.floor(Math.random() * 6),
      passengers: Array(Math.floor(Math.random() * 6)).fill(null).map(generatePassenger),
    },
    torontoToKingston: {
      departureTime: '20:00',
      availableSeats: Math.floor(Math.random() * 6),
      passengers: Array(Math.floor(Math.random() * 6)).fill(null).map(generatePassenger),
    },
  }
}

export default function AdminPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [rideData, setRideData] = useState<RideData | null>(generateRideData(currentDate))

  const changeDate = (increment: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + increment)
    setCurrentDate(newDate)
    setRideData(generateRideData(newDate))
  }

  const cancelRide = () => {
    setRideData(null)
  }

  const addRide = () => {
    setRideData(generateRideData(currentDate))
  }

  const changeTripTime = (trip: 'kingstonToToronto' | 'torontoToKingston', newTime: string) => {
    if (rideData) {
      setRideData({
        ...rideData,
        [trip]: {
          ...rideData[trip],
          departureTime: newTime,
        },
      })
    }
  }

  const addPassenger = (trip: 'kingstonToToronto' | 'torontoToKingston', name: string, phone: string, pickupLocation: string) => {
    if (rideData && rideData[trip].availableSeats > 0) {
      const newPassenger = { id: Math.random().toString(36).substr(2, 9), name, phone, pickupLocation }
      setRideData({
        ...rideData,
        [trip]: {
          ...rideData[trip],
          availableSeats: rideData[trip].availableSeats - 1,
          passengers: [...rideData[trip].passengers, newPassenger],
        },
      })
    }
  }

  const cancelBooking = (trip: 'kingstonToToronto' | 'torontoToKingston', passengerId: string, refundAmount: 'full' | 'half') => {
    if (rideData) {
      const updatedPassengers = rideData[trip].passengers.filter(p => p.id !== passengerId)
      
      setRideData({
        ...rideData,
        [trip]: {
          ...rideData[trip],
          availableSeats: rideData[trip].availableSeats + 1,
          passengers: updatedPassengers,
        },
      })
      alert(`Booking cancelled for passenger. Refund issued: ${refundAmount === 'full' ? 'Full amount' : 'Half amount'}`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ride Booking Admin</h1>
      <div className="flex items-center justify-between mb-4">
        <Button onClick={() => changeDate(-1)}><ChevronLeft /></Button>
        <span className="text-lg font-semibold">{currentDate.toDateString()}</span>
        <Button onClick={() => changeDate(1)}><ChevronRight /></Button>
      </div>
      {rideData ? (
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="kingston-to-toronto">
              <AccordionTrigger>Kingston to Toronto</AccordionTrigger>
              <AccordionContent>
                <RideDetails
                  title="Kingston to Toronto"
                  rideData={rideData.kingstonToToronto}
                  onChangeTime={(newTime) => changeTripTime('kingstonToToronto', newTime)}
                  onAddPassenger={(name, phone, pickupLocation) => addPassenger('kingstonToToronto', name, phone, pickupLocation)}
                  onCancelBooking={(passengerId, refundAmount) => cancelBooking('kingstonToToronto', passengerId, refundAmount)}
                  pickupLocations={kingstonLocations}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="toronto-to-kingston">
              <AccordionTrigger>Toronto to Kingston</AccordionTrigger>
              <AccordionContent>
                <RideDetails
                  title="Toronto to Kingston"
                  rideData={rideData.torontoToKingston}
                  onChangeTime={(newTime) => changeTripTime('torontoToKingston', newTime)}
                  onAddPassenger={(name, phone, pickupLocation) => addPassenger('torontoToKingston', name, phone, pickupLocation)}
                  onCancelBooking={(passengerId, refundAmount) => cancelBooking('torontoToKingston', passengerId, refundAmount)}
                  pickupLocations={torontoLocations}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button onClick={cancelRide} variant="destructive">Cancel All Rides for This Day</Button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 mb-4">No rides scheduled for this day.</p>
          <Button onClick={addRide}>Add Ride</Button>
        </div>
      )}
    </div>
  )
}

interface RideDetailsProps {
  title: string
  rideData: TripData
  onChangeTime: (newTime: string) => void
  onAddPassenger: (name: string, phone: string, pickupLocation: string) => void
  onCancelBooking: (passengerId: string, refundAmount: 'full' | 'half') => void
  pickupLocations: string[]
}

function RideDetails({ title, rideData, onChangeTime, onAddPassenger, onCancelBooking, pickupLocations }: RideDetailsProps) {
  const [newPassengerName, setNewPassengerName] = useState('')
  const [newPassengerPhone, setNewPassengerPhone] = useState('')
  const [newPassengerPickupLocation, setNewPassengerPickupLocation] = useState('')
  const [customPickupLocation, setCustomPickupLocation] = useState('')
  const [cancelPassengerId, setCancelPassengerId] = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState<'full' | 'half'>('full')

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p>Departure Time: {rideData.departureTime}</p>
      <p>Available Seats: {rideData.availableSeats}</p>
      <p>Passengers: {rideData.passengers.length}</p>
      <div className="mt-2 gap-2 flex justify-center">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="mr-2">Change Time</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Change Departure Time</DrawerTitle>
              <DrawerDescription>
                Enter the new departure time for this trip.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  defaultValue={rideData.departureTime}
                  onChange={(e) => onChangeTime(e.target.value)}
                />
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Save changes</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        
        <Drawer>
          <DrawerTrigger asChild>
            <Button disabled={rideData.availableSeats === 0}>Add Passenger</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add New Passenger</DrawerTitle>
              <DrawerDescription>
                Enter the passenger's details below.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="passengerName">Name</Label>
                <Input
                  id="passengerName"
                  value={newPassengerName}
                  onChange={(e) => setNewPassengerName(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="passengerPhone">Phone</Label>
                <Input
                  id="passengerPhone"
                  value={newPassengerPhone}
                  onChange={(e) => setNewPassengerPhone(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Select onValueChange={setNewPassengerPickupLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupLocations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newPassengerPickupLocation === 'Other' && (
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="customPickupLocation">Custom Pickup Location</Label>
                  <Input
                    id="customPickupLocation"
                    value={customPickupLocation}
                    onChange={(e) => setCustomPickupLocation(e.target.value)}
                  />
                </div>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button onClick={() => {
                  const pickupLocation = newPassengerPickupLocation === 'Other' ? customPickupLocation : newPassengerPickupLocation
                  onAddPassenger(newPassengerName, newPassengerPhone, pickupLocation)
                  setNewPassengerName('')
                  setNewPassengerPhone('')
                  setNewPassengerPickupLocation('')
                  setCustomPickupLocation('')
                }}>
                  Add Passenger
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      
      <div className="space-y-2 mt-4">
        <h3 className="font-semibold">Passenger List:</h3>
        {rideData.passengers.map((passenger) => (
          <Accordion type="single" collapsible key={passenger.id}>
            <AccordionItem value={passenger.id}>
              <AccordionTrigger className="text-left">
                <div>
                  <div>{passenger.name}</div>
                  <div className="text-sm text-gray-500">{passenger.phone}</div>
                  <div className="text-sm text-gray-500">Pickup: {passenger.pickupLocation}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
              
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button onClick={() => setCancelPassengerId(passenger.id)} variant="destructive" size="sm" className="mt-2">
                          Cancel Booking
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Cancel Booking</DrawerTitle>
                          <DrawerDescription>
                            Are you sure you want to cancel this booking? Choose the refund amount.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                          <RadioGroup defaultValue="full" onValueChange={(value) => setRefundAmount(value as 'full' | 'half')}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="full" id="full" />
                              <Label htmlFor="full">Full Refund</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="half" id="half" />
                              <Label htmlFor="half">Half Refund</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button onClick={() => {
                              if (cancelPassengerId) {
                                onCancelBooking(cancelPassengerId, refundAmount)
                                setCancelPassengerId(null)
                              }
                            }} variant="destructive">
                              Confirm Cancellation
                            </Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                 
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  )
}