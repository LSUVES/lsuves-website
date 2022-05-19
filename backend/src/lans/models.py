from django.db import models
from events.models import Event
from users.models import User


class CommitteeShift(models.Model):
    """
    Committee shift model, provides fields to associate each shift with a LAN,
    as well as the start and end times of the shift, and who'll be on duty.
    """

    lan = models.ForeignKey(
        Event, related_name="committee_shifts", on_delete=models.CASCADE
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    # TODO: Ensure users are staff
    #       Limit to two Users per CommitteeShift
    committee = models.ManyToManyField(User, related_name="committee_shifts")


class TicketRequest(models.Model):
    """
    Ticket request model, provides fields to associate ticket requests with a LAN,
    as well as the user requesting the ticket.
    """

    lan = models.ForeignKey(
        Event, related_name="ticket_requests", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User, related_name="ticket_requests", on_delete=models.CASCADE
    )

    class Meta:
        constraints = [
            # Ensure no two ticket requests are for the same user and LAN.
            models.UniqueConstraint(
                fields=["lan", "user"],
                name="%(app_label)s_%(class)s_is_unique_for_user_and_lan",
            )
        ]


class Ticket(models.Model):
    """
    Ticket model, provides fields to associate ticket with a LAN, a user, and a seat
    booking group. Also records whether the ticket has been activated, i.e., the
    ticket holder has been signed in by committee at the front desk of LAN, and the
    seat the ticket holder has entered into the LAN Auth website.
    """

    lan = models.ForeignKey(Event, related_name="tickets", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="tickets", on_delete=models.CASCADE)
    # is_member_ticket = models.BooleanField(default=False)
    seat_booking_group = models.ForeignKey(
        "SeatbookingGroup",
        related_name="tickets",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    is_activated = models.BooleanField(default=False)
    # TODO: Consider enforcing uniqueness. However, note that seat numbers are not
    #       used for small LANs (will likely require editing LAN Auth which is scary).
    seat = models.CharField("seat id", max_length=2, blank=True)

    class Meta:
        constraints = [
            # Ensure no two tickets are for the same user and LAN.
            models.UniqueConstraint(
                fields=["lan", "user"],
                name="%(app_label)s_%(class)s_is_unique_for_user_and_lan",
            )
        ]

    def __str__(self):
        return "{}'s ticket for {}".format(self.user.username, self.lan.name)


class SeatBookingGroup(models.Model):
    """
    Seat booking model, provides fields to associate seat booking with a LAN and the
    owner of the group. Also provides fields for a group name and preference (e.g.,
    in regards to location/number of seats).
    """

    lan = models.ForeignKey(
        Event, related_name="seat_booking_groups", on_delete=models.CASCADE
    )
    owner = models.OneToOneField(Ticket, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    preference = models.TextField(blank=True)

    class Meta:
        constraints = [
            # Ensure no two groups have the same name per LAN.
            models.UniqueConstraint(
                fields=["lan", "name"],
                name="%(app_label)s_%(class)s_name_is_unique_for_lan",
            )
        ]


class VanBooking(models.Model):
    """
    Van booking model, provides fields to associate van booking with a LAN and the
    requesting user. Also provides fields to record the user's contact phone number,
    pick-up address and postcode, whether they require the service for collection
    and/or drop-off, and what their availability is.
    """

    lan = models.ForeignKey(
        Event, related_name="van_bookings", on_delete=models.CASCADE
    )
    requester = models.OneToOneField(Ticket, on_delete=models.CASCADE)
    # TODO: Consider using a better field for this, see:
    #       https://stackoverflow.com/questions/19130942/whats-the-best-way-to-store-phone-number-in-django-models
    contact_phone_number = models.CharField(max_length=31, blank=True)
    address = models.CharField(max_length=200)
    # TODO: Add validation for this
    # See https://en.wikipedia.org/wiki/Postcodes_in_the_United_Kingdom
    postcode = models.CharField(max_length=8)
    collection_required = models.BooleanField(default=True)
    dropoff_required = models.BooleanField("drop-off required", default=True)
    availability = models.TextField()


class FoodOrderShop(models.Model):
    """
    Food order shop model, provides fields for the name of the shop, the time by which
    orders close, the time at which the order is expected to arrive, and whether orders
    for that shop are open (e.g., at some LANs we order McDonald's on Sunday morning,
    but not always).
    """

    # TODO: Make this unique
    name = models.CharField(max_length=50)
    # TODO: Consider using TimeFields for this and storing the day separately/using dynamically
    #       created datetime fields
    order_by = models.CharField(max_length=30)
    arrives_at = models.CharField(max_length=30)
    is_open = models.BooleanField(default=True)


class FoodOrderMenuItem(models.Model):
    """
    Food order menu item model, provides fields to associate the menu item with a shop,
    the name of the menu item, additional information about the menu item (e.g.,
    description from website, ingredients/allergens), and the price of the menu item.
    """

    shop = models.ForeignKey(
        FoodOrderShop, related_name="items", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    info = models.CharField(max_length=200, blank=True)
    price = models.DecimalField(max_digits=5, decimal_places=2)


class FoodOrder(models.Model):
    """
    Food order model, provides fields to associate the food order with a lan event and
    the user ordering, what menu item they've selected, and whether they've paid for it.
    """

    lan = models.ForeignKey(Event, related_name="food_orders", on_delete=models.CASCADE)
    orderer = models.ForeignKey(
        Ticket, related_name="food_orders", on_delete=models.CASCADE
    )
    option = models.OneToOneField(FoodOrderMenuItem, on_delete=models.CASCADE)
    paid = models.BooleanField("paid for order", default=False)
