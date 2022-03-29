from django.db import models
from users.models import User


class Lan(models.Model):
    """
    LAN model, provides fields for the LAN number, whether it's a half-LAN,
    and the LAN theme (e.g., Freshers', Halloween, Charity).

    Time and location should be accessed using the reverse relationship with
    the associated event, e.g., event__end_time.
    """

    # TODO: Provide auto-incrementing default value
    # next_lan_number = Lan.objects.latest("number").number + 1
    number = models.IntegerField()
    # If we ever have 3/4 LANs then just replace this with a
    # DecimalField(max_digits=1, decimal_places=1, default=0)
    is_half_lan = models.BooleanField(default=False)
    theme = models.CharField(max_length=50, blank=True)
    # ticket_price

    class Meta:
        constraints = [
            # Ensure every LAN number is unique
            models.UniqueConstraint(
                fields=["number", "is_half_lan"],
                name="%(app_label)s_%(class)s_number_is_unique",
            )
        ]


class CommitteeShift(models.Model):
    """
    Committee shift model, provides fields to associate each shift with a LAN,
    as well as the start and end times of the shift, and who'll be on duty.
    """

    lan = models.ForeignKey(
        Lan, related_name="committee_shifts", on_delete=models.CASCADE
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
        Lan, related_name="ticket_requests", on_delete=models.CASCADE
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)


class Ticket(models.Model):
    """
    Ticket model, provides fields to associate ticket with a LAN, a user, and a seat
    booking group. Also records whether the ticket has been activated, i.e., the
    ticket holder has been signed in by committee at the front desk of LAN, and the
    seat the ticket holder has entered into the LAN Auth website.
    """

    lan = models.ForeignKey(Lan, related_name="tickets", on_delete=models.CASCADE)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
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


class SeatBookingGroup(models.Model):
    lan = models.ForeignKey(
        Lan, related_name="seat_booking_groups", on_delete=models.CASCADE
    )
    owner = models.OneToOneField(Ticket, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    preference = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["lan", "name"],
                name="%(app_label)s_%(class)s_name_is_unique_for_lan",
            )
        ]


class VanBooking(models.Model):
    lan = models.ForeignKey(Lan, related_name="van_bookings", on_delete=models.CASCADE)
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
    name = models.CharField(max_length=50)
    # TODO: Consider using TimeFields for this and storing the day separately/using dynamically
    #       created datetime fields
    order_by = models.CharField(max_length=30)
    arrives = models.CharField(max_length=30)
    is_open = models.BooleanField(default=True)


class FoodOrderMenuItem(models.Model):
    shop = models.ForeignKey(
        FoodOrderShop, related_name="items", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    info = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=5, decimal_places=2)


class FoodOrder(models.Model):
    lan = models.ForeignKey(Lan, related_name="food_orders", on_delete=models.CASCADE)
    orderer = models.ForeignKey(
        Ticket, related_name="food_orders", on_delete=models.CASCADE
    )
    option = models.OneToOneField(FoodOrderMenuItem, on_delete=models.CASCADE)
    paid = models.BooleanField("paid for order", default=False)
