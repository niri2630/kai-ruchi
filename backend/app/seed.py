"""Seed the Kai Ruchi catalogue.

Idempotent: re-running updates rows in place instead of duplicating them.

    python -m app.seed          # categories, products, demo users, reviews
    python -m app.seed --wipe   # clear orders/carts/reviews first
"""
import sys
from decimal import Decimal

from sqlalchemy import func, select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import (
    Cart,
    CartItem,
    Category,
    Order,
    OrderEvent,
    OrderItem,
    Product,
    Review,
    User,
)

IMG = "/images/products"

CATEGORIES = [
    {
        "name": "Masalas",
        "slug": "masalas",
        "tagline": "Stone-ground the morning we pack them",
        "description": (
            "Whole spices, dry-roasted in an iron kadai until the kitchen smells "
            "like it should, then ground coarse. No colour, no anti-caking agent, "
            "no filler rava. They clump in humidity because there is nothing in "
            "them to stop it."
        ),
        "accent": "chilli",
        "sort_order": 1,
        "image_url": f"/images/categories/masalas.webp",
    },
    {
        "name": "Pickles",
        "slug": "pickles",
        "tagline": "Twenty-one days on the terrace",
        "description": (
            "Cut, salted, sun-cured, and only then met with oil and spice. Every "
            "batch is tied to a season and a specific tree, so no two years taste "
            "identical. Use a dry spoon and they will outlive the jar."
        ),
        "accent": "turmeric",
        "sort_order": 2,
        "image_url": f"/images/categories/pickles.webp",
    },
    {
        "name": "Fresh Batters",
        "slug": "fresh-batters",
        "tagline": "Ground at night, delivered cold by morning",
        "description": (
            "Sona masoori and urad dal, soaked separately, wet-ground, and left "
            "to ferment overnight. Shipped chilled within a day of grinding, "
            "because the whole point is that it is fresh."
        ),
        "accent": "leaf",
        "sort_order": 3,
        "image_url": f"/images/categories/fresh-batters.webp",
    },
    {
        "name": "Snacks",
        "slug": "snacks",
        "tagline": "Fried in small batches, never yesterday's",
        "description": (
            "The tin on top of the fridge that everyone raids at four o'clock. "
            "Fried the day it ships, drained properly, and packed while still "
            "warm enough to fog the bag."
        ),
        "accent": "indigo",
        "sort_order": 4,
        "image_url": f"/images/categories/snacks.webp",
    },
    {
        "name": "Sweets",
        "slug": "sweets",
        "tagline": "Ghee-heavy and unapologetic",
        "description": (
            "Made to order, never stocked. Which means a day or two longer to "
            "reach you and a texture that has not had time to go hard."
        ),
        "accent": "rose",
        "sort_order": 5,
        "image_url": f"/images/categories/sweets.webp",
    },
]

PRODUCTS = [
    # ---------------- Masalas ----------------
    {
        "name": "Chicken Sukka Masala",
        "slug": "chicken-sukka-masala",
        "category": "masalas",
        "short_description": "Mangalorean sukka blend — byadgi chilli, roasted coconut, a hard sear of coriander.",
        "description": (
            "This is the coastal Karnataka sukka masala, the dry one, where the "
            "coconut is roasted almost to the edge of burnt before it goes into "
            "the grinder. Byadgi chillies give it the colour without the assault; "
            "the heat comes from guntur that we add by hand, a smaller measure. "
            "Half a kilo of chicken takes three heaped spoons. Finish with curry "
            "leaves in coconut oil and do not add water — sukka means dry."
        ),
        "ingredients": (
            "Byadgi chilli, guntur chilli, coriander seed, roasted coconut, "
            "cumin, black pepper, fenugreek, mustard, turmeric, curry leaf, "
            "tamarind, rock salt"
        ),
        "shelf_life": "6 months, airtight, away from the stove",
        "price": "249", "compare_at_price": "299", "unit_label": "200 g",
        "sku": "KR-MAS-001", "stock_qty": 48, "spice_level": 3,
        "is_veg": False, "is_featured": True,
        "pairs_with": "Neer dosa, ghee rice, or plain kori roti",
    },
    {
        "name": "Chicken Fry Masala",
        "slug": "chicken-fry-masala",
        "category": "masalas",
        "short_description": "The Sunday-afternoon fry masala. Sticks to the meat, crisps in the pan.",
        "description": (
            "Coarser than the sukka, and built to cling. Rub it into chicken with "
            "curd and lemon, rest it for an hour, then shallow-fry until the edges "
            "catch. There is a little besan in the grind, which is what gives you "
            "the crust — the same trick every aunty uses and none of them admit to."
        ),
        "ingredients": (
            "Kashmiri chilli, coriander seed, cumin, black pepper, garlic, ginger, "
            "roasted gram flour, garam masala, turmeric, salt"
        ),
        "shelf_life": "6 months, airtight",
        "price": "229", "compare_at_price": None, "unit_label": "200 g",
        "sku": "KR-MAS-002", "stock_qty": 52, "spice_level": 2,
        "is_veg": False, "is_featured": True,
        "pairs_with": "Onion rings, lime, and a plate you can hold in one hand",
    },
    {
        "name": "Fish Fry Masala",
        "slug": "fish-fry-masala",
        "category": "masalas",
        "short_description": "Tamarind-forward and rava-friendly. Built for pomfret, bangda and anything with a spine.",
        "description": (
            "Coastal fish fry lives or dies on the sourness, so this one leans "
            "hard on tamarind and ajwain rather than more chilli. Make a thick "
            "paste with water, coat the fish, leave it twenty minutes, press into "
            "rava and shallow-fry in coconut oil. Works just as well on prawns."
        ),
        "ingredients": (
            "Byadgi chilli, tamarind, coriander seed, ajwain, turmeric, garlic, "
            "black pepper, fenugreek, asafoetida, salt"
        ),
        "shelf_life": "6 months, airtight",
        "price": "239", "compare_at_price": "279", "unit_label": "200 g",
        "sku": "KR-MAS-003", "stock_qty": 40, "spice_level": 2,
        "is_veg": False, "is_featured": False,
        "pairs_with": "Rava coating, coconut oil, raw onion",
    },
    {
        "name": "Sambar Masala",
        "slug": "sambar-masala",
        "category": "masalas",
        "short_description": "Roasted dal in the grind, not just spice. One spoon per serving is plenty.",
        "description": (
            "Most shop sambar powder is chilli and coriander with the volume "
            "turned up. This one has channa dal and urad dal roasted into it, "
            "which is where the body comes from — you need less of it, and the "
            "sambar thickens without a cornflour trick. Add it after the dal and "
            "vegetables are cooked, never at the tempering stage."
        ),
        "ingredients": (
            "Coriander seed, byadgi chilli, channa dal, urad dal, toor dal, "
            "fenugreek, cumin, black pepper, curry leaf, asafoetida, turmeric"
        ),
        "shelf_life": "8 months, airtight",
        "price": "189", "compare_at_price": None, "unit_label": "250 g",
        "sku": "KR-MAS-004", "stock_qty": 75, "spice_level": 1,
        "is_veg": True, "is_featured": True,
        "pairs_with": "Drumstick, small onions, and a hot idli",
    },
    # ---------------- Pickles ----------------
    {
        "name": "Mango Pickle",
        "slug": "mango-pickle",
        "category": "pickles",
        "short_description": "Raw totapuri, cut with the stone in, cured twenty-one days in the sun.",
        "description": (
            "Made once a year, in May, from totapuri mangoes cut so the stone "
            "stays attached to the piece — that is where the flavour hides. "
            "Salted and sun-cured on the terrace for three weeks before the "
            "mustard and chilli go in, then topped with gingelly oil until the "
            "pieces are fully under. Sharp on day one, rounder by month three."
        ),
        "ingredients": (
            "Raw mango, gingelly oil, red chilli powder, mustard, fenugreek, "
            "turmeric, asafoetida, rock salt"
        ),
        "shelf_life": "12 months. Dry spoon only.",
        "price": "279", "compare_at_price": "329", "unit_label": "400 g",
        "sku": "KR-PIC-001", "stock_qty": 36, "spice_level": 3,
        "is_veg": True, "is_featured": True,
        "pairs_with": "Curd rice. There is no second answer.",
    },
    {
        "name": "Lemon Pickle",
        "slug": "lemon-pickle",
        "category": "pickles",
        "short_description": "No oil, no water. Just lemon, salt, chilli and four months of waiting.",
        "description": (
            "The one your grandmother keeps for when someone is unwell. Lemons "
            "are quartered, packed in rock salt, and left until the skins go soft "
            "and translucent — about four months — before chilli and a mustard "
            "temper join in. Nothing is added to preserve it because the salt "
            "already did that job."
        ),
        "ingredients": "Lemon, rock salt, red chilli powder, mustard, fenugreek, turmeric",
        "shelf_life": "18 months. Gets better, not worse.",
        "price": "249", "compare_at_price": None, "unit_label": "400 g",
        "sku": "KR-PIC-002", "stock_qty": 44, "spice_level": 2,
        "is_veg": True, "is_featured": False,
        "pairs_with": "Curd rice, dal rice, or straight off the spoon",
    },
    {
        "name": "Garlic Pickle",
        "slug": "garlic-pickle",
        "category": "pickles",
        "short_description": "Whole peeled cloves, slow-cooked soft in gingelly oil and tamarind.",
        "description": (
            "Peeling this much garlic by hand is the reason we only make it twice "
            "a year. The cloves are cooked whole in gingelly oil on the lowest "
            "flame until they lose their raw bite and turn almost sweet, then "
            "finished with tamarind and chilli. Eat a clove whole; do not chop it."
        ),
        "ingredients": (
            "Garlic, gingelly oil, tamarind, red chilli powder, jaggery, mustard, "
            "fenugreek, salt"
        ),
        "shelf_life": "12 months. Dry spoon only.",
        "price": "269", "compare_at_price": None, "unit_label": "300 g",
        "sku": "KR-PIC-003", "stock_qty": 28, "spice_level": 3,
        "is_veg": True, "is_featured": False,
        "pairs_with": "Chapati, curd rice, or a very plain khichdi",
    },
    # ---------------- Fresh batters ----------------
    {
        "name": "Dosa Batter",
        "slug": "dosa-batter",
        "category": "fresh-batters",
        "short_description": "Sona masoori and urad, wet-ground and fermented overnight. Ships cold.",
        "description": (
            "Rice and urad dal soaked separately for six hours, ground wet in a "
            "stone grinder — not a mixie, the heat ruins it — and left to ferment "
            "overnight. It arrives chilled and slightly risen. Stir once, thin it "
            "with a splash of water, and keep the tawa hotter than feels right. "
            "Use within four days; keep it refrigerated the whole time."
        ),
        "ingredients": "Sona masoori rice, urad dal, fenugreek, salt, water",
        "shelf_life": "4 days refrigerated. It is a live batter.",
        "price": "99", "compare_at_price": None, "unit_label": "1 kg pouch",
        "sku": "KR-FRS-001", "stock_qty": 60, "spice_level": 0,
        "is_veg": True, "is_featured": True,
        "pairs_with": "Coconut chutney and any of our sambar masala",
    },
    {
        "name": "Idli Batter",
        "slug": "idli-batter",
        "category": "fresh-batters",
        "short_description": "Idli rice, thicker grind, more urad. Rises in the steamer, not on the counter.",
        "description": (
            "Same overnight ferment as the dosa batter but ground thicker, with "
            "parboiled idli rice and a higher share of urad dal. That ratio is "
            "the entire difference between an idli that stays soft an hour later "
            "and one that turns into a coaster. Do not stir it flat before "
            "steaming — fold it gently."
        ),
        "ingredients": "Parboiled idli rice, urad dal, fenugreek, salt, water",
        "shelf_life": "4 days refrigerated",
        "price": "99", "compare_at_price": None, "unit_label": "1 kg pouch",
        "sku": "KR-FRS-002", "stock_qty": 55, "spice_level": 0,
        "is_veg": True, "is_featured": False,
        "pairs_with": "Molaga podi, sesame oil, and no cutlery",
    },
    # ---------------- Snacks ----------------
    {
        "name": "Banana Chips",
        "slug": "banana-chips",
        "category": "snacks",
        "short_description": "Nendran, sliced into the oil itself, fried in coconut oil. Salted while hot.",
        "description": (
            "Kerala-style. Raw nendran bananas are sliced directly over the wok "
            "so the pieces hit hot coconut oil within a second of being cut — "
            "that is why they stay pale gold instead of browning. Salt water is "
            "flicked in at the end, which spits alarmingly and is the only way to "
            "get salt to stick. Nothing else goes in."
        ),
        "ingredients": "Raw nendran banana, coconut oil, salt, turmeric",
        "shelf_life": "45 days, sealed",
        "price": "149", "compare_at_price": "179", "unit_label": "250 g",
        "sku": "KR-SNK-001", "stock_qty": 90, "spice_level": 0,
        "is_veg": True, "is_featured": True,
        "pairs_with": "Filter coffee at 4pm",
    },
    {
        "name": "Chakli",
        "slug": "chakli",
        "category": "snacks",
        "short_description": "Hand-pressed spirals of rice and roasted gram. Snaps, never bends.",
        "description": (
            "Rice flour and roasted gram flour, bound with hot oil and butter, "
            "then pressed through a brass mould by hand — every spiral is a "
            "slightly different size and we have stopped apologising for it. "
            "Ajwain and sesame in the dough, fried on a medium flame so the "
            "inside cooks before the outside colours."
        ),
        "ingredients": (
            "Rice flour, roasted gram flour, sesame, ajwain, cumin, butter, "
            "asafoetida, chilli powder, salt, groundnut oil"
        ),
        "shelf_life": "30 days, airtight",
        "price": "169", "compare_at_price": None, "unit_label": "250 g",
        "sku": "KR-SNK-002", "stock_qty": 70, "spice_level": 1,
        "is_veg": True, "is_featured": False,
        "pairs_with": "Tea, and someone else's house",
    },
    {
        "name": "Papad",
        "slug": "papad",
        "category": "snacks",
        "short_description": "Urad papad, sun-dried three days. Roast on a flame or fry — both work.",
        "description": (
            "Urad dal flour worked with papad khar and black pepper, rolled thin "
            "by hand and dried on cloth on the terrace for three days. Roast it "
            "directly on a gas flame with tongs for twenty seconds a side, or "
            "deep-fry for five. Comes uncooked, twenty to a pack."
        ),
        "ingredients": "Urad dal flour, black pepper, cumin, asafoetida, papad khar, salt",
        "shelf_life": "6 months, dry and flat",
        "price": "119", "compare_at_price": None, "unit_label": "200 g / 20 pieces",
        "sku": "KR-SNK-003", "stock_qty": 120, "spice_level": 1,
        "is_veg": True, "is_featured": False,
        "pairs_with": "Every single meal on this site",
    },
    # ---------------- Sweets ----------------
    {
        "name": "Mysore Pak",
        "slug": "mysore-pak",
        "category": "sweets",
        "short_description": "The porous, ghee-drenched kind. Made to order, cut warm, never stocked.",
        "description": (
            "Besan, sugar and an amount of ghee we would rather not print, beaten "
            "continuously until the mixture goes from smooth to grainy to full of "
            "air — the whole thing takes twenty minutes and cannot be left alone "
            "for any of them. This is the soft, honeycombed Mysore pak, not the "
            "dense fudge sold under the same name. Made after you order it."
        ),
        "ingredients": "Besan, sugar, cow ghee, cardamom",
        "shelf_life": "10 days. It is mostly ghee and sugar; it will not last that long.",
        "price": "329", "compare_at_price": None, "unit_label": "400 g box",
        "sku": "KR-SWT-001", "stock_qty": 24, "spice_level": 0,
        "is_veg": True, "is_featured": True,
        "pairs_with": "Nothing. Do not dilute it.",
    },
    {
        "name": "Puran Poli",
        "slug": "puran-poli",
        "category": "sweets",
        "short_description": "Chana dal and jaggery puran, rolled thin enough to see through. Four to a pack.",
        "description": (
            "Chana dal cooked down with jaggery and cardamom into puran, stuffed "
            "into a soft maida-and-ghee dough and rolled out thin — thin enough "
            "that the filling shows through, which is the only test that matters. "
            "Griddled on both sides. Reheat on a tawa with ghee, never in a "
            "microwave, and eat with more ghee than you think is reasonable."
        ),
        "ingredients": "Chana dal, jaggery, maida, cardamom, nutmeg, cow ghee",
        "shelf_life": "5 days refrigerated",
        "price": "199", "compare_at_price": "229", "unit_label": "Pack of 4",
        "sku": "KR-SWT-002", "stock_qty": 30, "spice_level": 0,
        "is_veg": True, "is_featured": False,
        "pairs_with": "Warm milk, or a spoon of ghee melting on top",
    },
]

DEMO_USERS = [
    ("Meera Ramanathan", "meera@example.com", "+91 98450 11223"),
    ("Arjun Shetty", "arjun@example.com", "+91 99001 44556"),
    ("Divya Krishnan", "divya@example.com", "+91 90080 77661"),
    ("Nikhil Rao", "nikhil@example.com", "+91 98862 33445"),
    ("Fatima Sheikh", "fatima@example.com", "+91 97400 55882"),
    ("Sandeep Gowda", "sandeep@example.com", "+91 91082 66774"),
]

REVIEWS = [
    ("chicken-sukka-masala", "meera@example.com", 5, "Tastes like Mangalore",
     "I have bought four sukka masalas online and returned three. This one actually "
     "has roasted coconut in it — you can see it in the grind. Made kori sukka on "
     "Sunday and my mother asked which shop I got it from, which is the highest "
     "praise available in my family."),
    ("chicken-sukka-masala", "arjun@example.com", 5, "Three spoons is enough",
     "Went in with my usual heavy hand and it was too much. Follow the instruction "
     "on the label. Genuinely strong stuff."),
    ("chicken-sukka-masala", "nikhil@example.com", 4, None,
     "Excellent flavour. Clumped a bit in Bombay humidity but that is on the weather, "
     "not them. Broke it up with a fork and it was fine."),
    ("mango-pickle", "divya@example.com", 5, "The stone is attached",
     "Whoever cut these knew what they were doing — every piece has the stone still "
     "on it. Sharp and salty right now, and I am told it settles by month three. "
     "Already ordered a second jar to keep unopened."),
    ("mango-pickle", "fatima@example.com", 5, None,
     "Oil sits properly above the pieces, no shortcuts. Curd rice has been upgraded "
     "permanently."),
    ("dosa-batter", "sandeep@example.com", 5, "Arrived cold and alive",
     "Delivered chilled, still risen, smelled exactly right. First dosa was rubbish "
     "because my tawa was not hot enough; the next eleven were perfect. That one is "
     "my fault."),
    ("dosa-batter", "meera@example.com", 4, "Order the day before",
     "Great batter, just plan for it — four days is a real limit, not a suggestion. "
     "I now order it on Thursday for the weekend."),
    ("sambar-masala", "divya@example.com", 5, "You need less than you think",
     "Went in with two spoons out of habit and the sambar nearly walked out of the "
     "pot. One is plenty. The roasted dal makes it thick without any other help."),
    ("banana-chips", "arjun@example.com", 5, "Pale gold, not brown",
     "Fried in actual coconut oil, and you can tell from the smell when the bag opens. "
     "The 250 g lasted an evening, which is a complaint about me."),
    ("mysore-pak", "fatima@example.com", 5, "The soft kind",
     "This is the porous ghee one, not the hard fudge everyone else ships. It took an "
     "extra day to arrive because they make it after you order and that is exactly "
     "the right trade."),
    ("chicken-fry-masala", "sandeep@example.com", 4, None,
     "Crust is legitimately good — the besan trick works. Marinate the full hour, do "
     "not rush it like I did the first time."),
    ("chakli", "nikhil@example.com", 5, "Snaps properly",
     "Every one of them broke clean instead of bending. Sizes are all slightly "
     "different, which is how you know a machine did not make them."),
    ("papad", "meera@example.com", 4, None,
     "Twenty in a pack, roasts on the flame in about fifteen seconds. Nothing "
     "surprising here, which is the point of a papad."),
    ("lemon-pickle", "divya@example.com", 5, "No oil at all",
     "Exactly the type my grandmother made. Skins have gone soft and translucent, "
     "which only happens with real time in salt."),
    ("puran-poli", "arjun@example.com", 5, "Rolled thin",
     "You can see the puran through the dough. Reheated with ghee on a tawa as "
     "instructed. Four disappeared between two people."),
    ("fish-fry-masala", "fatima@example.com", 4, "Works on prawns too",
     "Used it on bangda first, then prawns. The tamarind is what makes it — most fish "
     "masalas just add more chilli and hope."),
]


def wipe_transactional(db) -> None:
    for model in (OrderEvent, OrderItem, Order, CartItem, Cart, Review):
        db.query(model).delete()
    db.commit()
    print("Cleared orders, carts and reviews.")


def seed() -> None:
    db = SessionLocal()
    try:
        if "--wipe" in sys.argv:
            wipe_transactional(db)

        # --- Categories ---
        by_slug: dict[str, Category] = {}
        for data in CATEGORIES:
            cat = db.scalar(select(Category).where(Category.slug == data["slug"]))
            if cat is None:
                cat = Category(**data)
                db.add(cat)
            else:
                for key, value in data.items():
                    setattr(cat, key, value)
            by_slug[data["slug"]] = cat
        db.commit()
        print(f"Categories: {len(CATEGORIES)}")

        # --- Products ---
        for data in PRODUCTS:
            payload = dict(data)
            category_slug = payload.pop("category")
            category = by_slug[category_slug]
            slug = payload["slug"]
            payload["price"] = Decimal(payload["price"])
            if payload.get("compare_at_price"):
                payload["compare_at_price"] = Decimal(payload["compare_at_price"])
            payload["image_url"] = f"{IMG}/{slug}.webp"
            # Second gallery shot is the shelf this product lives on — a context
            # frame rather than another angle on the same jar.
            payload["gallery"] = [
                f"{IMG}/{slug}.webp",
                f"/images/categories/{category_slug}.webp",
            ]

            product = db.scalar(select(Product).where(Product.slug == slug))
            if product is None:
                product = Product(category_id=category.id, **payload)
                db.add(product)
            else:
                product.category_id = category.id
                for key, value in payload.items():
                    setattr(product, key, value)
        db.commit()
        print(f"Products: {len(PRODUCTS)}")

        # --- Demo users (all share the same password) ---
        users: dict[str, User] = {}
        for name, email, phone in DEMO_USERS:
            user = db.scalar(select(User).where(User.email == email))
            if user is None:
                user = User(
                    full_name=name,
                    email=email,
                    phone=phone,
                    hashed_password=hash_password("kairuchi123"),
                )
                db.add(user)
            users[email] = user
        db.commit()
        print(f"Demo users: {len(DEMO_USERS)} (password for all: kairuchi123)")

        # --- Reviews ---
        added = 0
        for slug, email, rating, title, body in REVIEWS:
            product = db.scalar(select(Product).where(Product.slug == slug))
            user = users[email]
            if product is None:
                continue
            exists = db.scalar(
                select(Review).where(
                    Review.product_id == product.id, Review.user_id == user.id
                )
            )
            if exists:
                continue
            db.add(
                Review(
                    product_id=product.id,
                    user_id=user.id,
                    rating=rating,
                    title=title,
                    body=body,
                    is_verified_purchase=True,
                )
            )
            added += 1
        db.commit()

        # --- Roll ratings up onto the products ---
        for product in db.scalars(select(Product)).all():
            avg, count = db.execute(
                select(func.coalesce(func.avg(Review.rating), 0), func.count(Review.id))
                .where(Review.product_id == product.id)
            ).one()
            product.rating_avg = round(float(avg), 2)
            product.rating_count = count
        db.commit()
        print(f"Reviews: {added} new, {db.query(Review).count()} total")
        print("\nSeed complete. Sign in with meera@example.com / kairuchi123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
