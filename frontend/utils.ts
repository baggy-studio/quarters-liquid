export const money = (amount) => {
  let money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return money.format(Number(amount / 100)).replace("$", "");
};


export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
export const invlerp = (x: number, y: number, a: number) => clamp((a - x) / (y - x));
export const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));
export const range = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  a: number
) => lerp(x2, y2, invlerp(x1, y1, a));


export async function subscribeToList(listId: string, email: string): Promise<any> {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      revision: '2024-02-15',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'subscription',
        attributes: {
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email,
              },
            },
          },
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: listId,
            },
          },
        },
      },
    }),
  }

  try {
    const response = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=T8uDxc`, options)

    if (response.status == 202 || response.status == 200) {
      return response
    }

    const { errors } = await response.json()

    const error = errors[0]

    return error
  } catch {
    throw Error('Something went wrong')
  }
}

export function getQuantity(qty: number) {
  switch (qty) {
    case 1:
      return 'One';
    case 2:
      return 'Two';
    case 3:
      return 'Three';
    case 4:
      return 'Four';
    case 5:
      return 'Five';
    case 6:
      return 'Six';
    case 7:
      return 'Seven';
    case 8:
      return 'Eight';
    case 9:
      return 'Nine';
    case 10:
      return 'Ten';
    case 11:
      return 'Eleven';
    case 12:
      return 'Twelve';
    case 13:
      return 'Thirteen';
    case 14:
      return 'Fourteen';
    case 15:
      return 'Fifteen';
    case 16:
      return 'Sixteen';
    case 17:
      return 'Seventeen';
    case 18:
      return 'Eighteen';
    case 19:
      return 'Nineteen';
    case 20:
      return 'Twenty';
    default:
      return 'One';
  }
}